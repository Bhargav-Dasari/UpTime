import {
  Card,
  Metric,
  Text,
  Grid,
  Badge,
  Flex,
  Tracker,
  Title,
} from "@tremor/react";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function App() {
  const [data, setData] = useState([]);

  async function fetchData() {
    const { data, error } = await supabase
      .from("uptime_checks")
      .select("*")
      .order("timestamp", {
        ascending: false,
      });

    console.log(data);
    console.log(error);

    setData(data || []);
  }

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // GROUP CHECKS BY DOMAIN
  const grouped = {};

  data.forEach((check) => {
    if (!grouped[check.domain]) {
      grouped[check.domain] = [];
    }

    grouped[check.domain].push(check);
  });

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div>
          <Title>API Uptime Monitor</Title>

          <Text className="mt-2">
            Python + Supabase + React + Tremor
          </Text>
        </div>

        {/* DOMAIN CARDS */}
        <Grid
          numItems={1}
          numItemsMd={2}
          numItemsLg={3}
          className="gap-6"
        >

          {Object.entries(grouped).map(
            ([domain, checks]) => {

              const latest = checks[0];

              const isOnline =
                latest.status_code >= 200 &&
                latest.status_code < 300;

              const successCount = checks.filter(
                (c) =>
                  c.status_code >= 200 &&
                  c.status_code < 300
              ).length;

              const uptime =
                (
                  (successCount / checks.length) *
                  100
                ).toFixed(1);

              return (
                <Card
                  key={domain}
                  className="shadow-lg rounded-2xl"
                >

                  {/* DOMAIN */}
                  <Text>
                    {domain}
                  </Text>

                  {/* STATUS */}
                  <Flex
                    justifyContent="start"
                    alignItems="baseline"
                    className="mt-4 space-x-3"
                  >

                    <Metric>
                      {isOnline
                        ? "Operational"
                        : "Down"}
                    </Metric>

                    <Badge
                      color={
                        isOnline
                          ? "emerald"
                          : "rose"
                      }
                    >
                      HTTP {latest.status_code}
                    </Badge>

                  </Flex>

                  {/* LATENCY */}
                  <div className="mt-6">
                    <Text>
                      Latest Latency
                    </Text>

                    <Metric className="mt-1">
                      {latest.response_time}s
                    </Metric>
                  </div>

                  {/* UPTIME */}
                  <div className="mt-6">
                    <Text>
                      Uptime
                    </Text>

                    <Metric className="mt-1">
                      {uptime}%
                    </Metric>
                  </div>

                  {/* HISTORY */}
                  <div className="mt-8">
                    <Tracker
                      data={checks
                        .slice()
                        .reverse()
                        .map((check) => ({
                          color:
                            check.status_code >=
                              200 &&
                            check.status_code < 300
                              ? "emerald"
                              : "rose",

                          tooltip:
                            `HTTP ${check.status_code}`,
                        }))}
                    />
                  </div>

                </Card>
              );
            }
          )}

        </Grid>
      </div>
    </main>
  );
}