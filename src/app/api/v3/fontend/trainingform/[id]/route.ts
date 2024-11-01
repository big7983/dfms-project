import { PrismaClient, Training_Form } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    // ค้นหาข้อมูลจาก requester_id ที่ระบุ
    const trainingForms:Training_Form[] = await prisma.training_Form.findMany({
      where: { requester_id: id, active: true },
      orderBy: {
        latestupdate: 'desc', // เรียงลำดับจากล่าสุดเสมอ
      },
    });

    if (!trainingForms || trainingForms.length === 0) {
      return new Response("Error: ไม่พบข้อมูล Training Forms", {
        status: 404,
      });
    }

    // แปลงข้อมูลที่ดึงมาเป็นรูปแบบที่ต้องการ
    const responseData = trainingForms.map((trainingForm,index) => {
      const idform = trainingForm.id || "ไม่มีข้อมูล";
      const requester_name = trainingForm.requester_name || "ไม่มีข้อมูล";
      const course = trainingForm.information?.course || "ไม่มีข้อมูล";
      const datestart = trainingForm.information?.datestart || "ไม่มีข้อมูล";
      const dateend = trainingForm.information?.dateend || "ไม่มีข้อมูล";
      const datesubmiss = trainingForm.datesubmiss || "ไม่มีข้อมูล";
      const trainingstatus = trainingForm.trainingstatus;
      const issendrepoeted = trainingForm.issendrepoeted;
      const latestupdate = trainingForm.latestupdate;

      // คำนวณจำนวน stakeholders ทั้งหมดและที่ acknowledged เป็น true
      const stakeholders = trainingForm.stakeholders?.member || {};
      const isfullyacknowledged = trainingForm.stakeholders?.isfullyacknowledged ?? "ไม่มีข้อมูล";
      const totalStakeholders = Object.keys(stakeholders).length;
      const acknowledgedStakeholders = Object.values(stakeholders).filter(
        (stakeholder) => stakeholder.acknowledged === true
      ).length;

      // คำนวณจำนวน approver ทั้งหมดและที่ approved เป็น "approved"
      const approvers = trainingForm.approver?.member || {};
      const isfullyapproved = trainingForm.approver?.isfullyapproved ?? "ไม่มีข้อมูล";
      const totalApprovers = Object.keys(approvers).length;
      const approvedApprovers = Object.values(approvers).filter(
        (approver) => approver.approved === "approved"
      ).length;

      return {
        id: index+1,
        idform,
        requester_name,
        course,
        datestart,
        dateend,
        datesubmiss,
        trainingstatus,
        totalStakeholders,
        acknowledgedStakeholders,
        isfullyacknowledged,
        totalApprovers,
        approvedApprovers,
        isfullyapproved,
        issendrepoeted,
        latestupdate,
      };
    });

    // ส่งข้อมูลที่ต้องการกลับไป
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response("Error fetching training forms", {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
