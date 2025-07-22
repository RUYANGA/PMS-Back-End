import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { AuthService } from "../auth/auth.service";
import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { AssignRoleToUserDto } from "./dto/assign-role-to-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetUserPositionsDto } from "./dto/get-user-positions.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { SearchUserDto } from "./dto/search-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly infrastructure: InfrastructureService,
    private readonly logger: LoggerService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Creates a new user.
   * @param createUserDto The data for creating the user.
   * @returns The newly created user.
   */
  async create(createUserDto: CreateUserDto) {
    this.logger.log(`Attempting to create user: ${createUserDto.email}`, "UsersService");
    await this.infrastructure.checkDuplicate("user", [
      { property: "email", value: createUserDto.email },
      { property: "username", value: createUserDto.username },
      { property: "phone", value: createUserDto.phone },
    ]);

    const user = await this.prisma.user.create({
      data: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        username: createUserDto.username,
        email: createUserDto.email,
        phone: createUserDto.phone,
        userType: createUserDto.userType,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        userType: true,
      },
    });
    this.logger.log(`User created successfully with ID: ${user.id}`, "UsersService");

    await this.authService.sendCreatePasswordEmail(user.email);

    return {
      status: true,
      message: "User created successfully, and an email has been sent to create a password.",
      data: user,
      meta: {},
    };
  }

  /**
   * Retrieves all users with pagination and optional search.
   * @param Query The query parameters for pagination and search.
   * @returns A list of users and the total count.
   */
  async findAll(Query: SearchUserDto) {
    this.logger.log(`Retrieving users with query: ${JSON.stringify(Query)}`, "UsersService");
    const { search, page, limit, sortBy, sortOrder, userType, organisationUnitId } = Query;
    const skip = (page - 1) * limit;

    const validUserTypes = ["STUDENT", "STAFF", "INDIVIDUAL", "ORGANISATION"];
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
        { username: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        ...(validUserTypes.includes(search) ? [{ userType: search as any }] : []),
      ];
    }

    if (userType) {
      where.userType = userType;
    }

    if (organisationUnitId) {
      where.userPositions = {
        some: {
          position: { organisationUnitId },
        },
      };
    }
    const orderBy: any = {};
    if (
      sortBy &&
      ["firstName", "lastName", "username", "email", "phone", "id", "userType"].includes(sortBy)
    ) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.name = "asc"; // Default sorting
    }

    const [user, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          phone: true,
          userType: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    this.logger.log(
      `Found ${total} users, returning page ${page} with ${user.length} results`,
      "UsersService"
    );
    const totalPages = Math.ceil(total / limit);
    return {
      status: true,
      message: "Successfully retrieved items",
      data: user,
      meta: {
        pagination: {
          total,
          count: user.length,
          perPage: limit,
          currentPage: page,
          totalPages,
          links: {
            first: `/users?page=1&limit=${limit}`,
            last: `/users?page=${totalPages}&limit=${limit}`,
            prev: page > 1 ? `/users?page=${page - 1}&limit=${limit}` : null,
            next: page < totalPages ? `/users?page=${page + 1}&limit=${limit}` : null,
          },
        },
      },
    };
  }

  /**
   * Retrieves a user by their ID.
   * @param id The ID of the user.
   * @returns The found user.
   */
  async findOne(id: string) {
    this.logger.log(`Retrieving user with ID: ${id}`, "UsersService");
    await this.infrastructure.checkRecordExists("user", id);
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        userType: true,
        phone: true,
      },
    });
    this.logger.log(`Successfully retrieved user with ID: ${id}`, "UsersService");

    return {
      status: true,
      message: "User found successfully",
      data: user,
      meta: {},
    };
  }

  /**
   * Updates an existing user.
   * @param id The ID of the user to update.
   * @param updateUserDto The data for updating the user.
   * @returns The updated user.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    this.logger.log(
      `Attempting to update user ${id} with data: ${JSON.stringify(updateUserDto)}`,
      "UsersService"
    );
    try {
      await this.infrastructure.checkRecordExists("user", id);

      const { password, ...rest } = updateUserDto;

      const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

      const userUpdate = await this.prisma.user.update({
        where: { id },
        data: {
          ...rest,
          ...(hashedPassword && { password: hashedPassword }),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          phone: true,
          userType: true,
        },
      });

      this.logger.log(`User ${id} updated successfully`, "UsersService");
      return {
        status: true,
        message: "User updated successfully!",
        data: userUpdate,
        meta: {},
      };
    } catch (error) {
      this.logger.error(
        `Failed to update user ${id}: ${error.message}`,
        "UsersService",
        error.stack
      );
      if (error.code === "P2025") {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw new InternalServerErrorException("Failed to update user");
    }
  }

  /**
   * Deletes a user by their ID.
   * @param id The ID of the user to delete.
   * @returns The deleted user.
   */
  async remove(id: string) {
    this.logger.log(`Attempting to delete user: ${id}`, "UsersService");
    try {
      const deleteUser = await this.prisma.user.delete({
        where: {
          id: id,
        },
      });
      this.logger.log(`Successfully deleted user: ${id}`, "UsersService");
      return {
        status: true,
        message: "User deleted successfully!",
        data: deleteUser,
        meta: {},
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete user ${id}: ${error.message}`,
        "UsersService",
        error.stack
      );
      if (error.code === "P2025") {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw new InternalServerErrorException("Failed to update user");
    }
  }

  async getUserRoles(userId: string) {
    await this.infrastructure.checkRecordExists("user", userId);

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            organisationUnit: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        role: {
          name: "asc",
        },
      },
    });

    return {
      status: true,
      message: "User roles retrieved successfully",
      data: userRoles.map((ur) => ur.role),
      meta: {},
    };
  }

  async assignRoleToUser(userId: string, data: AssignRoleToUserDto) {
    await this.infrastructure.checkRecordExists("user", userId);
    await this.infrastructure.checkRecordExists("role", data.roleId);

    const existingAssignment = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: data.roleId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException("Role already assigned to this user");
    }

    const assignment = await this.prisma.userRole.create({
      data: {
        userId,
        roleId: data.roleId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        role: {
          include: {
            organisationUnit: true,
          },
        },
      },
    });

    return {
      status: true,
      message: "Role assigned to user successfully",
      data: assignment,
      meta: {},
    };
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    await this.infrastructure.checkRecordExists("user", userId);
    await this.infrastructure.checkRecordExists("role", roleId);

    const existingAssignment = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException("Role assignment not found for this user.");
    }

    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    return {
      status: true,
      message: "Role removed from user successfully",
      data: null,
      meta: {},
    };
  }

  /**
   * Retrieve currently authenticated user from JWT token
   * @param token JWT bearer token
   */
  async getMe(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return this.findOne(payload.sub);
    } catch (error) {
      this.logger.error(
        `Failed to decode token for getMe: ${error.message}`,
        "UsersService",
        error.stack
      );
      throw new UnauthorizedException("Invalid token");
    }
  }

  /**
   * Update currently authenticated user
   * @param token JWT bearer token
   * @param dto update data
   */
  async updateMe(token: string, dto: UpdateUserDto) {
    try {
      const payload = this.jwtService.verify(token);
      return this.update(payload.sub, dto);
    } catch (error) {
      this.logger.error(
        `Failed to decode token for updateMe: ${error.message}`,
        "UsersService",
        error.stack
      );
      throw new UnauthorizedException("Invalid token");
    }
  }

  /**
   * Get positions for a user with optional filters
   */
  async getUserPositions(userId: string, query: GetUserPositionsDto) {
    await this.infrastructure.checkRecordExists("user", userId);

    const { page = 1, limit = 10, sortBy, sortOrder, search, currentOnly } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (currentOnly) {
      where.OR = [{ endDate: null }, { endDate: { gt: new Date() } }];
    }
    if (search) {
      where.position = {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { organisationUnit: { name: { contains: search, mode: "insensitive" } } },
        ],
      };
    }

    const [assignments, total] = await this.prisma.$transaction([
      this.prisma.userPosition.findMany({
        where,
        skip,
        take: limit,
        include: { position: { include: { organisationUnit: true } } },
        orderBy: { [sortBy || "startDate"]: sortOrder || "desc" },
      }),
      this.prisma.userPosition.count({ where }),
    ]);

    return {
      status: true,
      message: "User positions retrieved successfully",
      data: assignments,
      meta: this.infrastructure.generatePaginationMeta(
        total,
        page,
        limit,
        `/users/${userId}/positions`
      ),
    };
  }

  /**
   * Get projects authored by a user
   */
  async getUserProjects(userId: string) {
    await this.infrastructure.checkRecordExists("user", userId);
    const authors = await this.prisma.projectAuthor.findMany({
      where: { userId },
      include: { project: true },
    });
    return {
      status: true,
      message: "User projects retrieved successfully",
      data: authors.map((a) => a.project),
      meta: {},
    };
  }
}
