"use client";

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { TextField, Select, MenuItem, createTheme, ThemeProvider } from "@mui/material";
import { useSession } from "next-auth/react";
import axios from "axios";
import Loader from "@/components/Loader";
import Link from "next/link";

interface RowData {
  id: number;
  course: string; // ฟิลด์นี้ควรมีอยู่
  datestart: string;
  dateend: string;
  isevaluated: boolean;
  isrepoeted: boolean;
  idform: string;
}

export default function Trainingsurvey() {
  const [rows, setRows] = useState<RowData[]>([]); // กำหนดประเภทข้อมูลของ rows เป็นอาร์เรย์ของ RowData
  const [searchText, setSearchText] = useState<string>(""); // state สำหรับค้นหา
  const [statusFilter, setStatusFilter] = useState<string>(""); // state สำหรับกรองสถานะ
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();

  const fetchData = async (id: string) => {
    try {
      const res = await axios.get(
        `/api/v3/fontend/trainingsurvey/${id}`
      );
      setRows(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchData(session?.user?.id);
    }
  }, [session?.user?.id]);

  const filteredRows = rows.filter((row) => {
    const matchesCourse = row.course
      .toLowerCase()
      .includes(searchText.toLowerCase());

    let matchesStatus = true; // เริ่มต้นด้วยค่า true

    if (statusFilter === "true") {
      matchesStatus = row.isrepoeted === true; // ตรวจสอบสถานะการรับทราบ
    } else if (statusFilter === "false") {
      matchesStatus = row.isrepoeted === false; // ตรวจสอบสถานะการไม่รับทราบ
    }

    return matchesCourse && matchesStatus;
  });

  const theme = createTheme({
    palette: {
      primary: {
        main: '#FF6500',
      },
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FF6500',
            },
          },
        },
      },
      
    },
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <ThemeProvider theme={theme}>

    <div className="bg-white sm:p-10 py-10 px-4 rounded-[20px]">
      <div className="w-full">
        <p className="text-black font-bold mb-6 text-xl">รายงานการเข้าอบรม</p>
        {/* ช่องค้นหา */}
        <div className="justify-between flex flex-col sm:flex-row">
          <TextField
            label="ค้นหา"
            variant="outlined"
            onChange={(e) => setSearchText(e.target.value)}
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
              <MenuItem value="true">ทำสำเร็จ</MenuItem>
              <MenuItem value="false">ยังไม่ได้ทำ</MenuItem>
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
              headerName: "วันเริ่มอบรม",
              width: 200,
              renderCell: (params) => (
                <>
                  {params.row.datestart} ถึง {params.row.dateend}
                </>
              ),
            },
            {
              field: "workflow",
              headerName: "สถานะ",
              width: 155,
              renderCell: (params) => (
                <>
                  {params.row.isrepoeted === false ? (
                    <div className="w-full justify-start items-center gap-2 inline-flex ">
                      <div className="w-4 h-4 bg-warning rounded-full"></div>
                      <div className="font-normal ">
                        ยังไม่ได้ทำรายงาน
                      </div>
                    </div>
                  ) : params.row.isevaluated === false ? (
                    <div className="w-full justify-start items-center gap-2 inline-flex ">
                      <div className="w-4 h-4 bg-warning rounded-full"></div>
                      <div className="font-normal ">
                        รอประเมิน
                      </div>
                    </div>
                  ) : params.row.isevaluated === true ? (
                    <div className="w-full justify-start items-center gap-2 inline-flex ">
                      <div className="w-4 h-4 bg-success rounded-full"></div>
                      <div className="font-normal ">
                        ประเมินสำเร็จ
                      </div>
                    </div>
                  ) : (
                    <div className="w-full justify-start items-center gap-2 inline-flex ">
                      <div className="w-4 h-4 bg-danger rounded-full"></div>
                      <div className="font-normal ">
                        เกิดข้อผิดพลาด
                      </div>
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
              width: 130,

              renderCell: (params) => (
                <>
                  {params.row.isrepoeted === false ? (
                    <Link
                      href={{
                        pathname: "/inputtrainingsurvey",
                        query: {
                          search: params.row.idform,
                        },
                      }}
                      className="items-center justify-center rounded-full bg-primary px-4 py-2.5 text-center font-medium text-white hover:bg-opacity-70 "
                    >
                      ทำรายงาน
                    </Link>
                  ) : params.row.isrepoeted === true ? (
                    <Link
                      href={{
                        pathname: "/detailltrainingsurvey",
                        query: {
                          search: params.row.idform,
                        },
                      }}
                      className="items-center justify-center rounded-full bg-primary px-4 py-2.5 text-center font-medium text-white hover:bg-opacity-70 "
                    >
                      รายละเอียด
                    </Link>
                  ) : (
                    <div className="w-full justify-start items-center gap-2 inline-flex ">
                      <div className="w-4 h-4 bg-danger rounded-full"></div>
                      <div className="font-normal ">เกิดข้อผิดพลาด</div>
                    </div>
                  )}
                </>
              ),
            },
          ]}
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
    </ThemeProvider>

  );
}
