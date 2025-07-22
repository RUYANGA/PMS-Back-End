import { PrismaClient } from "../../src/generated/prisma";

const prisma = new PrismaClient();

/**
 * Seed for positions across the organizational structure
 * This creates the specific positions as defined in d.json:
 * - Principal positions for each college
 * - Dean positions for each school
 */
export async function seedPositions() {
  console.log("🌱 Seeding positions...");

  try {
    // Get all colleges (direct children of University of Rwanda)
    const colleges = await prisma.organisationUnit.findMany({
      where: {
        parent: {
          code: "UR",
        },
      },
      include: {
        children: true, // Include schools
      },
    });

    if (colleges.length === 0) {
      console.log("⚠️  No colleges found. Please run organizations seed first.");
      return;
    }

    let positionsCreated = 0;

    // Create Principal positions for each college
    for (const college of colleges) {
      const principalPosition = await prisma.position.create({
        data: {
          title: `Principal of ${college.name}`,
          description: `Principal responsible for the overall leadership and management of the ${college.name}.`,
          organisationUnitId: college.id,
        },
      });

      console.log(`✅ Created Position: ${principalPosition.title}`);
      positionsCreated++;

      // Create Dean positions for each school in the college
      for (const school of college.children) {
        const deanPosition = await prisma.position.create({
          data: {
            title: `Dean of ${school.name}`,
            description: `Dean responsible for the academic leadership and administration of the ${school.name}.`,
            organisationUnitId: school.id,
          },
        });

        console.log(`✅ Created Position: ${deanPosition.title}`);
        positionsCreated++;
      }
    }

    console.log(`🎉 Successfully seeded ${positionsCreated} positions!`);
    console.log(
      `📊 Created ${colleges.length} Principal positions and ${positionsCreated - colleges.length} Dean positions`
    );
  } catch (error) {
    console.error("❌ Error seeding positions:", error);
    throw error;
  }
}

/**
 * Clean up function to remove all positions
 */
export async function cleanupPositions() {
  console.log("🧹 Cleaning up positions...");

  try {
    const deletedCount = await prisma.position.deleteMany({});
    console.log(`✅ Deleted ${deletedCount.count} positions`);
  } catch (error) {
    console.error("❌ Error cleaning up positions:", error);
    throw error;
  }
}
