"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  DataGrid,
  gridPageCountSelector,
  GridPagination,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import {
  TextField,
  Select,
  MenuItem,
  TablePaginationProps,
} from "@mui/material";
import MuiPagination from "@mui/material/Pagination";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Loader from "@/components/Loader";
// ตัวอย่างข้อมูล

interface RowData {
  id: number;
  course: string; // ฟิลด์นี้ควรมีอยู่
  datestart: string;
  dateend: string;
  datesubmiss: string;
  statusfrom: string;
  acknowledged: boolean;
  acknowledgedStakeholders: number;
  totalStakeholders: number;
  approvedApprovers: number;
  approved: string;
  totalApprovers: number;
  latestupdate: string;
  isfullyacknowledged: string;
  isfullyapproved: string; // เปลี่ยนเป็น string แทนที่จะเป็น boolean
  idform: string;
}

export default function Approveform() {
  const [rows, setRows] = useState<RowData[]>([]); // กำหนดประเภทข้อมูลของ rows เป็นอาร์เรย์ของ RowData
  const [searchText, setSearchText] = useState<string>(""); // state สำหรับค้นหา
  const [statusFilter, setStatusFilter] = useState<string>(""); // state สำหรับกรองสถานะ
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();

  const fetchData = async (email: string) => {
    try {
      const resid = await axios.get(`/api/v2/user/select/justid/${email}`);
      const res = await axios.get(
        `/api/v3/fontend/approveform/6707541eeb1d6f37899f42ac`
      );
      setRows(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchData(session?.user?.email);
    }

    if(!session){
      
    }
  }, [session?.user?.email]);

  // useEffect(() => {
  //   const filtered = rows.filter((row) => {
  //     const matchesSearch = row.name
  //       .toLowerCase()
  //       .includes(searchText.toLowerCase());
  //     const matchesStatus = statusFilter
  //       ? row.status.toLowerCase() === statusFilter.toLowerCase()
  //       : true; // กรองตามสถานะ
  //     return matchesSearch && matchesStatus; // เงื่อนไขการกรอง
  //   });
  //   setFilteredRows(filtered); // อัปเดตข้อมูลที่กรองแล้ว
  // }, [searchText, statusFilter, rows]);

  function Pagination({
    page,
    onPageChange,
    className,
  }: Pick<TablePaginationProps, "page" | "onPageChange" | "className">) {
    const apiRef = useGridApiContext();
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    return (
      <MuiPagination
        color="primary"
        className={className}
        count={pageCount}
        page={page + 1}
        onChange={(event, newPage) => {
          onPageChange(event as any, newPage - 1);
        }}
      />
    );
  }

  function CustomPagination(props: any) {
    return <GridPagination ActionsComponent={Pagination} {...props} />;
  }

  const filteredRows = rows.filter((row) => {
    const matchesCourse = row.course.toLowerCase().includes(searchText.toLowerCase());
  
    let matchesStatus = true; // เริ่มต้นด้วยค่า true
  
    if (statusFilter === "approved") {
      matchesStatus = row.approved === "approved"; // ตรวจสอบสถานะการอนุมัติ
    } else if (statusFilter === "unapproved") {
      matchesStatus = row.approved === "unapproved"; // ตรวจสอบสถานะการไม่อนุมัติ
    } else if (statusFilter === "pending") {
      matchesStatus = row.approved === "pending"; // ตรวจสอบสถานะรอการอนุมัติ
    } else if (statusFilter === "fullyapproved") {
      matchesStatus = row.isfullyapproved === "fullyapproved"; // ตรวจสอบสถานะการรับทราบ
    } else if (statusFilter === "fullyunapproved") {
      matchesStatus = row.isfullyapproved === "unapproved"; // ตรวจสอบสถานะการรอการรับทราบ
    }else if (statusFilter === "fullypending") {
      matchesStatus = row.isfullyapproved === "pending"; // ตรวจสอบสถานะการรอการรับทราบ
    } else if (statusFilter) {
      matchesStatus = row.isfullyapproved === statusFilter; // ค้นหาสถานะการอนุมัติ
    }
  
    return matchesCourse && matchesStatus;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-10 rounded-[20px]">
      <div className="w-full">
        <p className="text-black font-bold mb-6 text-xl">รายการขออนุมัติ</p>
        {/* ช่องค้นหา */}
        <div className="justify-between flex flex-col sm:flex-row">
        <TextField
            label="ค้นหา"
            variant="outlined"
            onChange={(e) => setSearchText(e.target.value)} // ค้นหาจากชื่อหลักสูตร
            size="small"
            style={{
              marginBottom: "1rem",
              marginRight: "1rem",
              minWidth: "225px",
              width: "100%",
              maxWidth: "350px",
            }}
          />
          <div className="flex justify-between max-w-[350px]">
            {/* ตัวกรองสถานะ */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)} // ตั้งค่าสถานะ
              displayEmpty
              size="small"
              style={{
                marginBottom: "1rem",
                width: "120px",
                border: 0,
              }}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              <MenuItem value="approved">คำร้องที่ฉันอนุมัติแล้ว</MenuItem>
              <MenuItem value="unapproved">คำร้องที่ฉันไม่อนุมัติ</MenuItem>
              <MenuItem value="pending">คำร้องที่รอฉันพิจาณา</MenuItem>             
              <MenuItem value="fullyapproved">คำร้องที่ถูกอนุมัติ</MenuItem>
              <MenuItem value="fullyunapproved">คำร้องที่ไม่ได้รับอนุมัติ</MenuItem>
              <MenuItem value="fullypending">คำร้องที่รออนุมัติ</MenuItem>
            </Select>
          </div>
        </div>

        <DataGrid
          autoHeight
          rows={filteredRows}
          columns={[
            {
              field: "id",
              headerName: "ลำดับ",
              width: 75,
              align: "center",
              headerAlign: "center",
            },
            { field: "course", headerName: "ชื่อหลักสูตร", width: 200 },
            {
              field: "datestart",
              headerName: "วันอบรม",
              width: 200,
              renderCell: (params: any) => (
                <>
                  {params.row.datestart} ถึง {params.row.dateend}
                </>
              ),
            },
            {
              field: "requester_name",
              headerName: "ผู้ยื่นคำร้อง",
              width: 225,
            },
            {
              field: "section",
              headerName: "หน่วยงาน",
              width: 100,
              align: "center",
              headerAlign: "center",
            },
            {
              field: "totalStakeholders",
              headerName: "ผู้เข้าร่วมจำนวน",
              width: 130,
              align: "center",
              headerAlign: "center",
            },
            {
              field: "datesubmiss",
              headerName: "วันยืนคำร้อง",
              width: 150,
            },
            {
              field: "status",
              headerName: "สถานะแบบอนุมัติ",
              width: 225,
              renderCell: (params: any) => (
                <>
                  {params.row.isfullyacknowledged === false ? (
                    <div className="w-full justify-start items-center gap-2 inline-flex ">
                      <div className="w-4 h-4 bg-meta-6 rounded-full"></div>
                      <div className="font-normal font-['Inter']">
                        ผู้มีส่วนร่วมรับทราบแล้ว (
                        {params.row.acknowledgedStakeholders}/
                        {params.row.totalStakeholders})
                      </div>
                    </div>
                  ) : params.row.isfullyapproved === "pending" ? (
                    <div className="w-full justify-start items-center gap-2 inline-flex ">
                      <div className="w-4 h-4 bg-meta-6 rounded-full"></div>
                      <div className="font-normal font-['Inter']">
                        รอผู้อนุมัติ ({params.row.approvedApprovers}/
                        {params.row.totalApprovers})
                      </div>
                    </div>
                  ) : params.row.isfullyapproved === "fullyapproved" ? (
                    <div className="w-full justify-start items-center gap-2 inline-flex ">
                      <div className="w-4 h-4 bg-meta-3 rounded-full"></div>
                      <div className="font-normal font-['Inter']">
                        อนุมัติแล้ว
                      </div>
                    </div>
                  ) : params.row.isfullyapproved === "unapproved" ? (
                    <div className="w-full justify-start items-center gap-2 inline-flex ">
                      <div className="w-4 h-4 bg-meta-1 rounded-full"></div>
                      <div className="font-normal font-['Inter']">
                        ไม่ได้รับการอนุมัติ
                      </div>
                    </div>
                  ) : (
                    <div className="w-full justify-start items-center gap-2 inline-flex ">
                      <div className="w-4 h-4 bg-meta-1 rounded-full"></div>
                      <div className="font-normal font-['Inter']">
                        เกิดข้อผิดพลาด
                      </div>
                    </div>
                  )}
                </>
              ),
            },
            {
              field: "approved",
              headerName: "สถานะการพิจารณา",
              width: 150,
              headerAlign: "center",
              renderCell: (params: any) => (
                <>
                  {params.row.approved === "approved" ? (
                    <div className="w-full h-full justify-center items-center inline-flex ">
                      <svg
                        className="w-6 h-6 text-meta-3 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : params.row.approved === "pending" ? (
                    <div className="w-full h-full justify-center items-center inline-flex ">
                      <svg
                        className="w-6 h-6 text-meta-6 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : params.row.approved === "unapproved" ? (
                    <div className="w-full h-full justify-center items-center inline-flex ">
                      <svg
                        className="w-6 h-6 text-meta-1 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-full justify-center items-center inline-flex ">
                      ???
                    </div>
                  )}
                </>
              ),
            },
            {
              field: "latestupdate",
              headerName: "อัพเดทล่าสุด",
              width: 150,
            },
            {
              field: "actions",
              headerName: "",
              headerAlign: "center",
              align: "center",
              sortable: false,
              disableColumnMenu: true,
              width: 150,

              renderCell: (params: any) => (
                <>
                  <Link
                    href={{
                      pathname: "/detaillapprover",
                      query: {
                        search: params.row.idform,
                      },
                    }}
                    className="p-2 rounded-2xl bg-meta-6 text-center font-medium text-black hover:bg-meta-8 "
                  >
                    รายละเอียด
                  </Link>
                </>
              ),
            },
          ]}
          slots={{
            pagination: CustomPagination,
          }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          sx={{
            boxShadow: 0,
            border: 0,
          }}
        />
      </div>
    </div>
  );
}
