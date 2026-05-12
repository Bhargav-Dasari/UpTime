import {
  Card,
  Metric,
  Text,
  Grid,
  Badge,
  Flex,
  Title,
  ProgressBar,
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

  // GROUP BY DOMAIN
  const grouped = {};

  data.forEach((check) => {

    if (!grouped[check.domain]) {
      grouped[check.domain] = [];
    }

    grouped[check.domain].push(check);
  });

  return (

    <main className="min-h-screen bg-slate-100 p-8">

      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <div>
          <Title>
            API Uptime Monitor
          </Title>

          <Text className="mt-2 text-lg">
            Python + FastAPI + Supabase + React + Tremor
          </Text>
        </div>

        {/* SERVICE CARDS */}
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

              const uptime = (
                (successCount / checks.length) *
                100
              ).toFixed(1);

              return (

                <Card
                  key={domain}
                  className="rounded-2xl shadow-xl"
                >

                  {/* DOMAIN */}
                  <div className="flex items-center justify-between">

                    <div>
                      <Text>
                        Website
                      </Text>

                      <Title className="mt-1 text-xl break-all">
                        {domain}
                      </Title>
                    </div>

                    <Badge
                      color={
                        isOnline
                          ? "emerald"
                          : "rose"
                      }
                    >
                      {isOnline
                        ? "ONLINE"
                        : "DOWN"}
                    </Badge>
                  </div>

                  {/* METRICS */}
                  <Grid
                    numItems={2}
                    className="gap-4 mt-8"
                  >

                    <div>
                      <Text>
                        Status Code
                      </Text>

                      <Metric>
                        {latest.status_code}
                      </Metric>
                    </div>

                    <div>
                      <Text>
                        Latency
                      </Text>

                      <Metric>
                        {latest.response_time}s
                      </Metric>
                    </div>

                  </Grid>

                  {/* UPTIME */}
                  <div className="mt-8">

                    <Flex>
                      <Text>
                        Uptime
                      </Text>

                      <Text>
                        {uptime}%
                      </Text>
                    </Flex>

                    <ProgressBar
                      value={Number(uptime)}
                      color={
                        Number(uptime) > 95
                          ? "emerald"
                          : "amber"
                      }
                      className="mt-2"
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