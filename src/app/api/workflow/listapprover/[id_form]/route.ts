// app/api/workflow/[id_form]/approvers/route.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id_form: string } }
) {
  try {
    const { id_form } = params;

    // Fetch the workflow entry based on id_form
    const workflow = await prisma.workFlow.findUnique({
      where: { id_form: id_form },
      select: {
        approver: true, // Select the approver field
      },
    });

    // Check if workflow exists
    if (!workflow) {
      return new Response("Workflow not found", { status: 404 });
    }

    // Parse approver data
    const approvers = workflow.approver;

    // Return the approver data
    return new Response(JSON.stringify(approvers), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching approvers:", error);
    return new Response("Error fetching approvers", {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}