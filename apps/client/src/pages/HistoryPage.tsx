
import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Typography, Alert } from "@mui/joy";
import Layout from "../components/common/Layout";
import { CONFIG } from "../utils/constants";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
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
        <Button color="danger" onClick={clearHistory} disabled={loading}>
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
          {history.map((menu, idx) => (
            <Card key={idx} variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography level="h5" sx={{ mb: 1 }}>Menu #{history.length - idx}</Typography>
                <pre style={{ background: "#f9f9f9", padding: 12, borderRadius: 6, overflowX: "auto", margin: 0 }}>
                  {JSON.stringify(menu, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Layout>
  );
}
