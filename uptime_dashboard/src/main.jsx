"use client";

import {
  Card,
  Title,
  Text,
  Tracker,
  Flex,
  Grid,
  Badge,
  Metric,
} from "@tremor/react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function UptimeDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA FROM SUPABASE
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("uptime_checks")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      setData(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // AUTO REFRESH EVERY 30 SECONDS
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-20 text-center">
        Connecting to Monitoring Service...
      </div>
    );
  }

  // BUSINESS LOGIC
  const latestCheck = data[0] || {
    status_code: 0,
    response_time: 0,
  };

  const isOnline =
    latestCheck.status_code >= 200 &&
    latestCheck.status_code < 300;

  const totalChecks = data.length;

  const successCount = data.filter(
    (d) =>
      d.status_code >= 200 &&
      d.status_code < 300
  ).length;

  const uptimePercentage =
    totalChecks > 0
      ? (
          (successCount / totalChecks) *
          100
        ).toFixed(1)
      : "0";

  return (
    <main className="p-6 md:p-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">

        <Title className="text-2xl font-bold">
          API Uptime Monitor
        </Title>

        <Text>
          Backend: Python + Supabase |
          Frontend: React + Tremor
        </Text>

        <Grid
          numItemsMd={2}
          numItemsLg={3}
          className="gap-6"
        >

          {/* CURRENT STATUS */}
          <Card
            decoration="top"
            decorationColor={
              isOnline ? "emerald" : "rose"
            }
          >
            <Text>Current Status</Text>

            <Flex
              justifyContent="start"
              alignItems="baseline"
              className="space-x-3"
            >
              <Metric>
                {isOnline
                  ? "Operational"
                  : "Service Down"}
              </Metric>

              <Badge
                color={
                  isOnline
                    ? "emerald"
                    : "rose"
                }
              >
                HTTP {latestCheck.status_code}
              </Badge>
            </Flex>
          </Card>

          {/* SUCCESS RATE */}
          <Card
            decoration="top"
            decorationColor="blue"
          >
            <Text>
              Success Rate (Last 50)
            </Text>

            <Metric>
              {uptimePercentage}%
            </Metric>
          </Card>

          {/* LATENCY */}
          <Card
            decoration="top"
            decorationColor="amber"
          >
            <Text>Latest Latency</Text>

            <Metric>
              {latestCheck.response_time}s
            </Metric>
          </Card>
        </Grid>

        {/* HISTORY TRACKER */}
        <Card>
          <Title>Uptime History</Title>

          <Text className="mb-4">
            Historical view of the last{" "}
            {totalChecks} checks
          </Text>

          <Tracker
            data={data
              .slice()
              .reverse()
              .map((check) => ({
                color:
                  check.status_code >= 200 &&
                  check.status_code < 300
                    ? "emerald"
                    : "rose",

                tooltip: `${check.timestamp}: HTTP ${check.status_code}`,
              }))}
            className="mt-6"
          />
        </Card>
      </div>
    </main>
  );
}