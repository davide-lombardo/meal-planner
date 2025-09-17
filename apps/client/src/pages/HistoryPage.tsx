import { useEffect, useState } from "react";
import { useTheme } from "@mui/joy/styles";
import { Input } from "@mui/joy";
import JoyPagination from "../components/JoyPagination";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Select,
  Option,
} from "@mui/joy";
import ConfirmDialog from "../components/dialog/ConfirmDialog";
import dayjs from "dayjs";
import Layout from "../components/common/Layout";
import { CONFIG } from "../utils/constants";

export default function HistoryPage() {
  const theme = useTheme();
  const DEFAULT_PAGE_SIZE = 5;

  const [filterDate, setFilterDate] = useState<string>("");
  type HistoryMenu = {
    menu: any;
    [key: string]: any;
  };
  const [history, setHistory] = useState<HistoryMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const fetchHistory = async (pageNum = 1, date?: string, size = pageSize) => {
    setLoading(true);
    setError("");
    try {
      let url = `${CONFIG.API_BASE_URL}/menu/history?page=${pageNum}&limit=${size}`;
      if (date) {
        url += `&date=${date}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setHistory(data.history || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError("Failed to load history");
    }
    setLoading(false);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
    fetchHistory(1, filterDate, size);
  };

  const clearHistory = async () => {
    setLoading(true);
    setError("");
    try {
      await fetch(`${CONFIG.API_BASE_URL}/menu/history/clear`, {
        method: "POST",
      });
      fetchHistory(page);
    } catch (err) {
      setError("Failed to clear history");
      setLoading(false);
    }
    setConfirmOpen(false);
  };

  useEffect(() => {
    fetchHistory(page, filterDate, pageSize);
  }, [page, filterDate, pageSize]);

  const daysOfWeek = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica",
  ];

  return (
    <Layout
      title="Menu History"
      subtitle="View and manage your previously generated weekly menus"
      showBackButton={true}
    >
      <Box
        sx={{
          mb: 5,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            mr: { xs: 0, sm: 2 },
            mb: { xs: 2, sm: 0 },
          }}
        >
          <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 500 }}>
            Filter by date
          </Typography>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            sx={{ maxWidth: { xs: "100%", sm: 220 } }}
            slotProps={{
              input: { min: "2000-01-01", max: dayjs().format("YYYY-MM-DD") },
            }}
          />
        </Box>
        <Button
          color="danger"
          variant="soft"
          onClick={() => setConfirmOpen(true)}
          disabled={loading}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Clear History
        </Button>
      </Box>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={clearHistory}
        message="Are you sure you want to clear all history? This action cannot be undone."
      />
      {error && (
        <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
          }}
        >
          <Typography level="h4" sx={{ color: "text.secondary" }}>
            Loading history...
          </Typography>
        </Box>
      ) : history.length === 0 ? (
        <Card variant="soft" color="neutral" sx={{ mb: 2 }}>
          <CardContent>
            <Typography level="h4">No history found.</Typography>
            <Typography>No menus have been generated yet.</Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Box>
            {history.map((menu, idx) => {
              const parsedMenu = menu;
              let dateLabel = "";
              if (menu.created_at) {
                dateLabel = dayjs(Number(menu.created_at)).format(
                  "D MMMM YYYY - HH:mm"
                );
              }
              return (
                <Box
                  key={idx}
                  sx={{
                    mb: 4,
                    mx: "auto",
                    maxWidth: { xs: "100%", sm: 800 },
                    backgroundColor: "background.level1",
                    border: "3px solid",
                    borderColor: "primary.700",
                    borderRadius: 0,
                    boxShadow: "shadow.lg",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: "none",
                      opacity: 0.3,
                    },
                  }}
                >
                  {/* Decorative corner flourishes */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 15,
                      left: 15,
                      width: 30,
                      height: 30,
                      border: "2px solid",
                      borderColor: "primary.700",
                      borderRight: "none",
                      borderBottom: "none",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: -2,
                        left: -2,
                        width: 10,
                        height: 10,
                        border: "2px solid",
                        borderColor: "primary.700",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 15,
                      right: 15,
                      width: 30,
                      height: 30,
                      border: "2px solid",
                      borderColor: "primary.700",
                      borderLeft: "none",
                      borderBottom: "none",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 10,
                        height: 10,
                        border: "2px solid",
                        borderColor: "primary.700",
                        borderLeft: "none",
                        borderBottom: "none",
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 4, pt: 5, position: "relative", zIndex: 1 }}>
                    {/* Menu Header */}
                    <Box
                      sx={{
                        textAlign: "center",
                        mb: 4,
                        borderBottom: "2px solid",
                        borderColor: "primary.700",
                        pb: 3,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "1.5rem", sm: "2.5rem" },
                          fontFamily: "inherit",
                          fontWeight: "bold",
                          color: "primary.700",
                          letterSpacing: "0.1em",
                          mb: 1,
                        }}
                      >
                        {dateLabel || `Menu #${history.length - idx}`}
                      </Typography>
                 
                    </Box>
                    {/* Days Grid */}
                    <Box>
                      {daysOfWeek.map((day, i) => (
                        <Box
                          key={day}
                          sx={{
                            mb: 3,
                            borderBottom: i < 6 ? "1px dotted" : "none",
                            borderColor: "primary.500",
                            pb: i < 6 ? 3 : 0,
                          }}
                        >
                          {/* Day Header */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                              justifyContent: "center",
                            }}
                          >
                            <Box
                              sx={{
                                flex: 1,
                                height: 1,
                                bgcolor: "primary.500",
                                opacity: 0.4,
                              }}
                            />
                            <Typography
                              sx={{
                                mx: 3,
                                fontSize: { xs: "1.1rem", sm: "1.4rem" },
                                fontFamily: "inherit",
                                fontWeight: "bold",
                                color: "primary.700",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                              }}
                            >
                              {day}
                            </Typography>
                            <Box
                              sx={{
                                flex: 1,
                                height: 1,
                                bgcolor: "primary.500",
                                opacity: 0.4,
                              }}
                            />
                          </Box>
                          {/* Meal Items */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                              gap: { xs: 2, sm: 4 },
                              px: { xs: 0, sm: 2 },
                            }}
                          >
                            {/* Pranzo */}
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: { xs: "0.95rem", sm: "1.1rem" },
                                  fontFamily: "inherit",
                                  fontWeight: "bold",
                                  color: "primary.700",
                                  mb: 1,
                                  textAlign: "center",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                Pranzo
                              </Typography>
                              <Box
                                sx={{
                                  minHeight: 50,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "primary.100",
                                  border: "1px dashed",
                                  borderColor: "primary.500",
                                  borderRadius: 1,
                                  p: 2,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: { xs: "0.9rem", sm: "1rem" },
                                    fontFamily: "inherit",
                                    color: theme.palette.primary[900],
                                    fontStyle: parsedMenu?.pranzo?.[i]?.nome
                                      ? "normal"
                                      : "italic",
                                    textAlign: "center",
                                    lineHeight: 1.4,
                                    opacity: parsedMenu?.pranzo?.[i]?.nome
                                      ? 1
                                      : 0.7,
                                  }}
                                >
                                  {parsedMenu?.pranzo?.[i]?.nome ||
                                    "— Non disponibile —"}
                                </Typography>
                              </Box>
                            </Box>
                            {/* Cena */}
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: "1.1rem",
                                  fontFamily: "inherit",
                                  fontWeight: "bold",
                                  color: "primary.700",
                                  mb: 1,
                                  textAlign: "center",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                Cena
                              </Typography>
                              <Box
                                sx={{
                                  minHeight: 50,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "primary.100",
                                  border: "1px dashed",
                                  borderColor: "primary.500",
                                  borderRadius: 1,
                                  p: 2,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: { xs: "0.9rem", sm: "1rem" },
                                    fontFamily: "inherit",
                                    color: theme.palette.primary[900],
                                    fontStyle: parsedMenu?.cena?.[i]?.nome
                                      ? "normal"
                                      : "italic",
                                    textAlign: "center",
                                    lineHeight: 1.4,
                                    opacity: parsedMenu?.cena?.[i]?.nome
                                      ? 1
                                      : 0.7,
                                  }}
                                >
                                  {parsedMenu?.cena?.[i]?.nome ||
                                    "— Non disponibile —"}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    {/* Footer decoration */}
                    <Box
                      sx={{
                        textAlign: "center",
                        mt: 4,
                        pt: 3,
                        borderTop: "2px solid",
                        borderColor: "primary.700",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          fontFamily: "inherit",
                          fontStyle: "italic",
                          color: "primary.700",
                          opacity: 0.7,
                        }}
                      >
                        ✦ Buon Appetito ✦
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
              alignItems: "center",
              mt: 4,
              gap: { xs: 2, sm: 2 },
              flexWrap: "wrap",
            }}
          >
            <JoyPagination
              page={page}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
            <Typography level="body-md" sx={{ ml: 2 }}>
              Menus per page:
            </Typography>
            <Box>
              <Select
                value={pageSize}
                onChange={(event, value) =>
                  value && changePageSize(Number(value))
                }
                size="md"
                color="neutral"
                variant="outlined"
              >
                {[5, 10, 20, 50].map((size) => (
                  <Option key={size} value={size}>
                    {size}
                  </Option>
                ))}
              </Select>
            </Box>
          </Box>
        </>
      )}
    </Layout>
  );
}
