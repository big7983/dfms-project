import { sendEmail } from "@/utils/sendEmail";
import { history } from "@/utils/history";
import { verificationEmailTemplate } from "@/utils/verificationEmailTemplate";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function sendNotificationEmail(
  approverEmail: any,
  recieverName: string,
  course: any
) {
  try {
    const message = `มีแบบฟอร์มฝึกอบรมใหม่ ${course} กำลังรอการอนุมัติจากคุณ.`;
    const messages = verificationEmailTemplate(recieverName, message);
    // Send verification email
    await sendEmail(
      approverEmail,
      "แจ้งเตือน : แบบฟอร์มการฝึกอบรมใหม่ต้องได้รับการอนุมัติ",
      messages
    );
  } catch (error) {
    console.error("Failed to send email : 500", error);
    return new Response("Failed to send email : 500  ", {
      status: 500,
    });
  }
}

async function sendNotificationhistory(
  userid: string,
  formid: string,
  fromname: string,
  nameuser: string,
  course: any
) {
  try {
    const action = `มีแบบฟอร์มฝึกอบรมใหม่ ${course} กำลังรอการอนุมัติจากคุณ.`;

    // Send verification email
    await history(userid, nameuser, action);
  } catch (error) {
    console.error("Failed to send email : 500", error);
    return new Response("Failed to send email : 500  ", {
      status: 500,
    });
  }
}

export async function PATCH(req: Request) {

  try {
    const { id, approverId, opinion, statusapproved } = await req.json();
    const trainingForm = await prisma.training_Form.findFirst({
      where: { id: id },
      select: {
        requester_id: true,
        approver: true,
        information: true,
      },
    });

    if (!trainingForm) {
      return new Response("Training Form not found", { status: 404 });
    }

    // ค้นหา stakeholder ตาม id
    const approver = trainingForm.approver;
    const member = approver.member as any;

    const updatedMember = Object.keys(member).reduce((acc, key) => {
      const approver = member[key];
      if (approver.id === approverId) {
        approver.approved = statusapproved;
        approver.opinion = opinion;
      }
      acc[key] = approver;
      return acc;
    }, {} as Record<string, any>);

    let isfullyapproved: string;

    if (
      Object.values(updatedMember).every(
        (app: { approved: string }) => app.approved === "approved"
      )
    ) {
      isfullyapproved = "fullyapproved";
    } else if (
      Object.values(updatedMember).some(
        (app: { approved: string }) => app.approved === "unapproved"
      )
    ) {
      isfullyapproved = "unapproved";
    } else {
      isfullyapproved = "pending";
    }

    const updatedApprover = await prisma.training_Form.update({
      where: { id: id },
      data: {
        approver: {
          member: updatedMember,
          isfullyapproved: isfullyapproved,
          approvalorder: trainingForm.approver.approvalorder + 1,
        },
        latestupdate: new Date().toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Bangkok",
        }),
      },
    });

    if (
      statusapproved === "approved" &&
      !Object.values(updatedMember).every(
        (app: { approved: string }) => app.approved === "approved"
      )
    ) {
      const ApproverID = (trainingForm.approver as any)?.member[
        approver.approvalorder
      ].id;
      const nextApprover = (trainingForm.approver as any)?.member[
        approver.approvalorder
      ];
      const recieverName = (trainingForm.approver as any)?.member[
        approver.approvalorder
      ];
      if (nextApprover && nextApprover.email) {
        await sendNotificationEmail(
          nextApprover.email,
          recieverName.name,
          trainingForm.information?.course
        );

        await sendNotificationhistory(
          ApproverID || "",
          id,
          "trainingfrom",
          recieverName.name,
          trainingForm.information?.course
        );
      }
    }

    return new Response(JSON.stringify(updatedApprover), { status: 200 });
  } catch (error) {
    console.error("Error updating approver:", error);
    return new Response("Error updating approver" + error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
