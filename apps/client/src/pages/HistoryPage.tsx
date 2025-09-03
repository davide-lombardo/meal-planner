import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Typography, Alert } from "@mui/joy";
import dayjs from "dayjs";
import Layout from "../components/common/Layout";
import { CONFIG } from "../utils/constants";
import { formatMenu } from "../utils/formatMenu";

export default function HistoryPage() {
  type HistoryMenu = {
    menu: any;
    [key: string]: any;
  };
  const [history, setHistory] = useState<HistoryMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/menu/history`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      setError("Failed to load history");
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    setLoading(true);
    setError("");
    try {
      await fetch(`${CONFIG.API_BASE_URL}/menu/history/clear`, { method: "POST" });
      fetchHistory();
    } catch (err) {
      setError("Failed to clear history");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <Layout
      title="Menu History"
      subtitle="View and manage your previously generated weekly menus"
      showBackButton={true}
    >
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button color="danger" variant="soft" onClick={clearHistory} disabled={loading}>
          Clear History
        </Button>
      </Box>
      {error && (
        <Alert color="danger" variant="soft" sx={{ mb: 2 }}>{error}</Alert>
      )}
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
          <Typography level="h4" sx={{ color: "text.secondary" }}>Loading history...</Typography>
        </Box>
      ) : history.length === 0 ? (
        <Card variant="soft" color="neutral" sx={{ mb: 2 }}>
          <CardContent>
            <Typography level="h4">No history found.</Typography>
            <Typography>No menus have been generated yet.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {history.map((menu, idx) => {
            // Use the history item directly as the menu object
            const parsedMenu = menu;

            let dateLabel = '';
            if (menu.created_at) {
              dateLabel = dayjs(Number(menu.created_at)).format('D MMMM YYYY HH:mm');
            }
            const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
            return (
              <Card key={idx} variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography level="title-md" sx={{ mb: 1 }}>
                    {dateLabel ? `Menu from ${dateLabel}` : `Menu #${history.length - idx}`}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 4, mb: 2, px: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography level="title-lg" fontWeight="lg">Pranzo</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography level="title-lg" fontWeight="lg">Cena</Typography>
                      </Box>
                    </Box>
                    {daysOfWeek.map((day, i) => (
                      <Box key={day} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: i % 2 === 0 ? 'neutral.softBg' : 'background.level1', display: 'flex', gap: 4 }}>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography level="body-sm">{parsedMenu?.pranzo?.[i]?.nome || "—"}</Typography>
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography level="body-sm">{parsedMenu?.cena?.[i]?.nome || "—"}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Layout>
  );
}
