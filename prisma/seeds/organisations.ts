import { PrismaClient } from "../../src/generated/prisma";

const prisma = new PrismaClient();

/**
 * Seed for University of Rwanda organizational structure
 * Creates the hierarchical organization from university -> colleges -> schools
 * This creates the exact structure as defined in d.json
 */
export async function seedOrganisations() {
  console.log("🌱 Seeding University of Rwanda organizational structure...");

  try {
    // Create University of Rwanda (Root organization)
    const university = await prisma.organisationUnit.create({
      data: {
        name: "University of Rwanda",
        code: "UR",
        parentId: null,
      },
    });

    console.log(`✅ Created University: ${university.name} (${university.code})`);

    // Define colleges with their schools
    const collegesData = [
      {
        name: "College of Arts and Social Sciences",
        code: "CASS",
        schools: [
          {
            name: "School of Arts and Languages and Communication Studies",
          },
          {
            name: "School of Social Studies and Governance",
          },
          {
            name: "School of Law",
          },
        ],
      },
      {
        name: "College of Agriculture, Animal Sciences and Veterinary Medicine",
        code: "CAVM",
        schools: [
          {
            name: "School of Medicine and Animal Sciences",
          },
          {
            name: "School of Agriculture and Food Sciences",
          },
          {
            name: "School of Agricultural Engineering",
          },
          {
            name: "School of Forestry, Ecotourism, and Greenspace Management",
          },
        ],
      },
      {
        name: "College of Business and Economics",
        code: "CBE",
        schools: [
          {
            name: "School of Business",
          },
          {
            name: "School of Economics",
          },
        ],
      },
      {
        name: "College of Education",
        code: "CE",
        schools: [
          {
            name: "School of Mathematics and Science Education",
          },
          {
            name: "School of Languages and Social Studies Education",
          },
          {
            name: "School of Educational Sciences",
          },
        ],
      },
      {
        name: "College of Medicine and Health Sciences",
        code: "CMHS",
        schools: [
          {
            name: "School of Medicine & Pharmacy",
          },
          {
            name: "School of Dentistry",
          },
          {
            name: "School of Nursing and Midwifery",
          },
          {
            name: "School of Health Sciences",
          },
          {
            name: "School of Public Health",
          },
        ],
      },
      {
        name: "College of Science and Technology",
        code: "CST",
        schools: [
          {
            name: "School of Engineering",
          },
          {
            name: "School of Science",
          },
          {
            name: "School of Information Communication Technology",
          },
          {
            name: "School of Architecture and Built Environment",
          },
          {
            name: "School of Mining and Geology",
          },
        ],
      },
    ];

    // Create colleges and their schools
    for (const collegeData of collegesData) {
      // Create college
      const college = await prisma.organisationUnit.create({
        data: {
          name: collegeData.name,
          code: collegeData.code,
          parentId: university.id,
        },
      });

      console.log(`✅ Created College: ${college.name} (${college.code})`);

      // Create schools under the college
      for (const schoolData of collegeData.schools) {
        const school = await prisma.organisationUnit.create({
          data: {
            name: schoolData.name,
            code: null, // Schools don't have codes in the provided data
            parentId: college.id,
          },
        });

        console.log(`  ✅ Created School: ${school.name}`);
      }
    }

    console.log("🎉 Successfully seeded University of Rwanda organizational structure!");
    console.log(`📊 Created 1 University + 6 Colleges + 25 Schools = 32 organizational units`);
  } catch (error) {
    console.error("❌ Error seeding organizational structure:", error);
    throw error;
  }
}

/**
 * Clean up function to remove all organizational units
 * Use this to reset the organizational structure
 */
export async function cleanupOrganisations() {
  console.log("🧹 Cleaning up organizational structure...");

  try {
    // Delete in reverse order (schools first, then colleges, then university)
    await prisma.organisationUnit.deleteMany({
      where: {
        parent: {
          parent: {
            code: "UR",
          },
        },
      },
    });

    await prisma.organisationUnit.deleteMany({
      where: {
        parent: {
          code: "UR",
        },
      },
    });

    await prisma.organisationUnit.deleteMany({
      where: {
        code: "UR",
      },
    });

    console.log("✅ Organizational structure cleaned up successfully!");
  } catch (error) {
    console.error("❌ Error cleaning up organizational structure:", error);
    throw error;
  }
}
