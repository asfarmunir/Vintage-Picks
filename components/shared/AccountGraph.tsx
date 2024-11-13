"use client";
import { useGetGraphData } from "@/app/hooks/useGetGraphData";
import { accountStore } from "@/app/store/account";
import { LoaderCircle } from "lucide-react";
import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GraphDataType {
  date: string;
  balance: number;
}

const Example = ({ filter }: { filter: "1M" | "3M" | "24H" | "7D" }) => {
  const account = accountStore((state) => state.account);
  const { data, isPending } = useGetGraphData(account.id);

  const filteredData: GraphDataType[] = useMemo(()=>{
    if (!data) return [];
    switch (filter) {
      case "1M":
        return data.slice(-720);
      case "3M":
        return data.slice(-2160);
      case "7D":
        return data.slice(-168);
      case "24H":
        return data.slice(-24);
      default:
        return data;
    }    
  }, [data, filter])
  
  if (isPending) {
    return (
      <div className="bg-primary-100 flex justify-center items-center h-[310px] gap-2">
        <LoaderCircle className="animate-spin" />
        Loading Graph...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={310}>
      <AreaChart
        data={filteredData}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 10,
        }}
      >
        {/* <CartesianGrid strokeDasharray="3 3" stroke="#444" /> */}
        <XAxis
          dataKey="date"
          tick={{
            fill: "#737897",
            fontSize: 8, // Adjust the font size
            dy: 10, // Adjust vertical position
            dx: 15, // Adjust horizontal position
          }}
          tickLine={{ stroke: "#737897" }}
          allowDuplicatedCategory
        />
        <YAxis
          // ticks={[0, 1000, 2000, 3000, 4000, 5000]}
          tick={{
            fill: "#737897",
            fontSize: 12, // Adjust the font size
            dy: 0, // Adjust vertical position
            dx: -10, // Adjust horizontal position
          }}
          tickLine={{ stroke: "#737897" }}
        />
        <Tooltip
          cursor={{ fill: "#282227" }}
          contentStyle={{
            backgroundColor: "#333547",
            border: "1px solid #282227",
            borderRadius: "10px",
            padding: "20px 45px",
          }}
          labelStyle={{ color: "#737897", fontSize: 16 }}
          itemStyle={{
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
          }}
        />
        <Area
          type="linear"
          dataKey="balance"
          stroke="#3fd80c"
          fill="rgba(63, 216, 12, 0.1)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Example;
