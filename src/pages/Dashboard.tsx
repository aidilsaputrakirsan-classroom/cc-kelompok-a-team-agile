import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Package, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function DashboardPage() {
  const { komoditas, pasar, hargaPelaporan } = useData();
  const [selectedPasar, setSelectedPasar] = useState<string>('all');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');

  const filteredPelaporan = useMemo(() => {
    let data = hargaPelaporan;
    if (selectedPasar !== 'all') data = data.filter(h => h.pasar_id === selectedPasar);
    return data;
  }, [hargaPelaporan, selectedPasar]);

  // Summary cards per komoditas - like reference image
  const summaryCards = useMemo(() => {
    return komoditas.map(k => {
      const entries = filteredPelaporan
        .filter(h => h.komoditas_id === k.id)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
      const latest = entries[entries.length - 1];
      const prev = entries[entries.length - 2];
      let trend: 'naik' | 'turun' | 'stabil' = 'stabil';
      let diff = 0;
      let pct = 0;
      if (latest && prev) {
        diff = latest.harga_rata_rata - prev.harga_rata_rata;
        pct = prev.harga_rata_rata > 0 ? (diff / prev.harga_rata_rata) * 100 : 0;
        trend = diff > 0 ? 'naik' : diff < 0 ? 'turun' : 'stabil';
      }
      return { komoditas: k, latest, trend, diff, pct, entries };
    });
  }, [komoditas, filteredPelaporan]);

  const chartData = useMemo(() => {
    const dates = [...new Set(filteredPelaporan.map(h => h.tanggal))].sort();
    return dates.map(d => {
      const row: Record<string, string | number> = { tanggal: d };
      komoditas.forEach(k => {
        const entry = filteredPelaporan.find(h => h.tanggal === d && h.komoditas_id === k.id);
        row[k.nama] = entry?.harga_rata_rata ?? 0;
      });
      return row;
    });
  }, [filteredPelaporan, komoditas]);

  const colors = ['hsl(36, 61%, 64%)', 'hsl(222, 47%, 30%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)', 'hsl(210, 40%, 50%)', 'hsl(280, 60%, 50%)'];

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Dashboard Harga Pangan</h1>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedPasar} onValueChange={setSelectedPasar}>
            <SelectTrigger className="w-full sm:w-44 h-9 text-sm">
              <SelectValue placeholder="Semua Pasar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Pasar</SelectItem>
              {pasar.map(p => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Commodity Price Cards Grid - Reference style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {summaryCards.map(({ komoditas: k, latest, trend, diff, pct }) => (
          <Card key={k.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              {/* Image area */}
              <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center overflow-hidden">
                {k.gambar ? (
                  <img src={k.gambar} alt={k.nama} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-10 w-10 text-muted-foreground/40" />
                )}
              </div>
              {/* Info */}
              <div className="p-3 space-y-1.5">
                <h3 className="text-sm font-semibold leading-tight truncate">{k.nama}</h3>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold">
                    {latest ? `Rp ${latest.harga_rata_rata.toLocaleString('id-ID')}` : '-'}
                  </p>
                  <span className="text-xs text-muted-foreground">/ {k.satuan_dasar}</span>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>Harga rata-rata pelaporan</TooltipContent>
                  </UITooltip>
                </div>
                {/* Trend indicator */}
                <div className="flex items-center gap-1">
                  {trend === 'naik' && <TrendingUp className="h-3.5 w-3.5 text-destructive" />}
                  {trend === 'turun' && <TrendingDown className="h-3.5 w-3.5 text-green-600" />}
                  {trend === 'stabil' && <Minus className="h-3.5 w-3.5 text-accent" />}
                  <span className={`text-xs font-semibold ${
                    trend === 'naik' ? 'text-destructive' : trend === 'turun' ? 'text-green-600' : 'text-accent'
                  }`}>
                    {trend === 'stabil'
                      ? '0,00%'
                      : `${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct).toFixed(2)}% (Rp ${Math.abs(diff).toLocaleString('id-ID')})`
                    }
                  </span>
                </div>
                {/* Mini progress bar */}
                <Progress
                  value={Math.min(Math.abs(pct) * 10, 100)}
                  className="h-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tren Harga Pelaporan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="tanggal" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {komoditas.map((k, i) => (
                    <Line key={k.id} type="monotone" dataKey={k.nama} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Perbandingan Harga</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="tanggal" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {komoditas.map((k, i) => (
                    <Bar key={k.id} dataKey={k.nama} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {chartData.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada data harga pelaporan.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Finalisasi harga rutin untuk melihat dashboard.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
