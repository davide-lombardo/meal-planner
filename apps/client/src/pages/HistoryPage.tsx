import { useEffect, useState } from "react";
import { useTheme } from "@mui/joy/styles";
import { Input, CircularProgress } from "@mui/joy";
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
import MenuHistoryCard from "../components/MenuHistoryCard";

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
          <CircularProgress size="lg" color="primary" />
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
            {history.map((menu, idx) => (
              <MenuHistoryCard key={idx} menu={menu} idx={idx} total={history.length} />
            ))}
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
