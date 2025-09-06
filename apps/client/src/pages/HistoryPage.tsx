import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Typography, Alert } from "@mui/joy";
import ConfirmDialog from "../components/dialog/ConfirmDialog";
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/menu/history`);
      const data = await res.json();
      const sorted = (data.history || []).slice().sort((a: HistoryMenu, b: HistoryMenu) => {
        if (a.created_at && b.created_at) return Number(b.created_at) - Number(a.created_at);
        return 0;
      });
      setHistory(sorted);
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
    setConfirmOpen(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

  return (
    <Layout
      title="Menu History"
      subtitle="View and manage your previously generated weekly menus"
      showBackButton={true}
    >
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button color="danger" variant="soft" onClick={() => setConfirmOpen(true)} disabled={loading}>
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
            const parsedMenu = menu;
            let dateLabel = '';
            if (menu.created_at) {
              dateLabel = dayjs(Number(menu.created_at)).format('D MMMM YYYY');
            }

            return (
              <Box key={idx} sx={{ 
                mb: 4, 
                mx: 'auto',
                maxWidth: 800,
                backgroundColor: 'background.level1',
                border: '3px solid',
                borderColor: 'primary.700',
                borderRadius: 0,
                boxShadow: 'shadow.lg',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 24px, var(--joy-palette-primary-100) 25px)',
                  pointerEvents: 'none',
                  opacity: 0.3
                }
              }}>
                {/* Decorative corner flourishes */}
                <Box sx={{
                  position: 'absolute',
                  top: 15,
                  left: 15,
                  width: 30,
                  height: 30,
                  border: '2px solid',
                  borderColor: 'primary.700',
                  borderRight: 'none',
                  borderBottom: 'none',
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    width: 10,
                    height: 10,
                    border: '2px solid',
                    borderColor: 'primary.700',
                    borderRight: 'none',
                    borderBottom: 'none',
                  }} />
                </Box>
                <Box sx={{
                  position: 'absolute',
                  top: 15,
                  right: 15,
                  width: 30,
                  height: 30,
                  border: '2px solid',
                  borderColor: 'primary.700',
                  borderLeft: 'none',
                  borderBottom: 'none',
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 10,
                    height: 10,
                    border: '2px solid',
                    borderColor: 'primary.700',
                    borderLeft: 'none',
                    borderBottom: 'none',
                  }} />
                </Box>

                <Box sx={{ p: 4, pt: 5, position: 'relative', zIndex: 1 }}>
                  {/* Menu Header */}
                  <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid', borderColor: 'primary.700', pb: 3 }}>
                    <Typography sx={{ 
                      fontSize: '2.5rem',
                      fontFamily: 'serif',
                      fontWeight: 'bold',
                      color: 'primary.700',
                      letterSpacing: '0.1em',
                      mb: 1
                    }}>
                      MENU SETTIMANALE
                    </Typography>
                    <Box sx={{ 
                      width: 100, 
                      height: 1, 
                      bgcolor: 'primary.500', 
                      mx: 'auto', 
                      mb: 2 
                    }} />
                    <Typography sx={{ 
                      fontSize: '1.2rem',
                      fontFamily: 'serif',
                      fontStyle: 'italic',
                      color: 'primary.700',
                      opacity: 0.8
                    }}>
                      {dateLabel || `Menu #${history.length - idx}`}
                    </Typography>
                  </Box>

                  {/* Days Grid */}
                  <Box>
                    {daysOfWeek.map((day, i) => (
                      <Box key={day} sx={{ 
                        mb: 3,
                        borderBottom: i < 6 ? '1px dotted' : 'none',
                        borderColor: 'primary.500',
                        pb: i < 6 ? 3 : 0
                      }}>
                        {/* Day Header */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          justifyContent: 'center'
                        }}>
                          <Box sx={{ flex: 1, height: 1, bgcolor: 'primary.500', opacity: 0.4 }} />
                          <Typography sx={{ 
                            mx: 3,
                            fontSize: '1.4rem',
                            fontFamily: 'serif',
                            fontWeight: 'bold',
                            color: 'primary.700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                          }}>
                            {day}
                          </Typography>
                          <Box sx={{ flex: 1, height: 1, bgcolor: 'primary.500', opacity: 0.4 }} />
                        </Box>

                        {/* Meal Items */}
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr',
                          gap: 4,
                          px: 2
                        }}>
                          {/* Pranzo */}
                          <Box>
                            <Typography sx={{ 
                              fontSize: '1.1rem',
                              fontFamily: 'serif',
                              fontWeight: 'bold',
                              color: 'primary.700',
                              mb: 1,
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Pranzo
                            </Typography>
                            <Box sx={{
                              minHeight: 50,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'primary.100',
                              border: '1px dashed',
                              borderColor: 'primary.500',
                              borderRadius: 1,
                              p: 2
                            }}>
                              <Typography sx={{ 
                                fontSize: '1rem',
                                fontFamily: 'serif',
                                color: parsedMenu?.pranzo?.[i]?.nome ? 'text.primary' : 'primary.700',
                                fontStyle: parsedMenu?.pranzo?.[i]?.nome ? 'normal' : 'italic',
                                textAlign: 'center',
                                lineHeight: 1.4,
                                opacity: parsedMenu?.pranzo?.[i]?.nome ? 1 : 0.7
                              }}>
                                {parsedMenu?.pranzo?.[i]?.nome || '— Non disponibile —'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Cena */}
                          <Box>
                            <Typography sx={{ 
                              fontSize: '1.1rem',
                              fontFamily: 'serif',
                              fontWeight: 'bold',
                              color: 'primary.700',
                              mb: 1,
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Cena
                            </Typography>
                            <Box sx={{
                              minHeight: 50,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'primary.100',
                              border: '1px dashed',
                              borderColor: 'primary.500',
                              borderRadius: 1,
                              p: 2
                            }}>
                              <Typography sx={{ 
                                fontSize: '1rem',
                                fontFamily: 'serif',
                                color: parsedMenu?.cena?.[i]?.nome ? 'text.primary' : 'primary.700',
                                fontStyle: parsedMenu?.cena?.[i]?.nome ? 'normal' : 'italic',
                                textAlign: 'center',
                                lineHeight: 1.4,
                                opacity: parsedMenu?.cena?.[i]?.nome ? 1 : 0.7
                              }}>
                                {parsedMenu?.cena?.[i]?.nome || '— Non disponibile —'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Footer decoration */}
                  <Box sx={{ 
                    textAlign: 'center', 
                    mt: 4, 
                    pt: 3, 
                    borderTop: '2px solid',
                    borderColor: 'primary.700'
                  }}>
                    <Typography sx={{
                      fontSize: '0.9rem',
                      fontFamily: 'serif',
                      fontStyle: 'italic',
                      color: 'primary.700',
                      opacity: 0.7
                    }}>
                      ✦ Buon Appetito ✦
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Layout>
  );
}