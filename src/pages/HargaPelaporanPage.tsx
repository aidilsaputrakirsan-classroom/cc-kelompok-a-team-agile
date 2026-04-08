import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/csv-utils';

export default function HargaPelaporanPage() {
  const { hargaPelaporan, komoditas, pasar } = useData();
  const isMobile = useIsMobile();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterPasar, setFilterPasar] = useState<string>('all');

  const detail = hargaPelaporan.find(h => h.id === detailId);
  const detailKom = detail ? komoditas.find(k => k.id === detail.komoditas_id) : null;
  const detailPas = detail ? pasar.find(p => p.id === detail.pasar_id) : null;

  const filtered = hargaPelaporan
    .filter(h => {
      const kom = komoditas.find(k => k.id === h.komoditas_id);
      const pas = pasar.find(p => p.id === h.pasar_id);
      const q = search.toLowerCase();
      return (kom?.nama || '').toLowerCase().includes(q) || (pas?.nama || '').toLowerCase().includes(q);
    })
    .filter(h => filterPasar === 'all' || h.pasar_id === filterPasar)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const handleExport = () => {
    const data = hargaPelaporan.map(h => ({
      tanggal: h.tanggal,
      komoditas: komoditas.find(k => k.id === h.komoditas_id)?.nama || '',
      pasar: pasar.find(p => p.id === h.pasar_id)?.nama || '',
      harga_besar: h.harga_besar ?? '',
      harga_menengah: h.harga_menengah ?? '',
      harga_kecil: h.harga_kecil ?? '',
      harga_rata_rata: h.harga_rata_rata,
    }));
    exportToCSV(data, 'harga-pelaporan', [
      { key: 'tanggal', label: 'Tanggal' },
      { key: 'komoditas', label: 'Komoditas' },
      { key: 'pasar', label: 'Pasar' },
      { key: 'harga_besar', label: 'Harga Besar' },
      { key: 'harga_menengah', label: 'Harga Menengah' },
      { key: 'harga_kecil', label: 'Harga Kecil' },
      { key: 'harga_rata_rata', label: 'Harga Rata-rata' },
    ]);
    toast.success('Data diekspor');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">Harga Pelaporan</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Ekspor
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9" />
        </div>
        <Select value={filterPasar} onValueChange={setFilterPasar}>
          <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Semua Pasar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Pasar</SelectItem>
            {pasar.map(p => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Belum ada data. Finalisasi harga rutin untuk menghasilkan harga pelaporan.
          </CardContent>
        </Card>
      )}

      {isMobile ? (
        <div className="space-y-2">
          {filtered.map(h => {
            const kom = komoditas.find(k => k.id === h.komoditas_id);
            const pas = pasar.find(p => p.id === h.pasar_id);
            return (
              <Card key={h.id} className="cursor-pointer hover:border-accent/40 transition-colors" onClick={() => setDetailId(h.id)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{kom?.nama || '-'}</h3>
                      <p className="text-xs text-muted-foreground">{pas?.nama} • {h.tanggal}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-accent">Rp {h.harga_rata_rata.toLocaleString('id-ID')}</p>
                      <p className="text-xs text-muted-foreground">Rata-rata</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Komoditas</TableHead>
                <TableHead>Pasar</TableHead>
                <TableHead className="text-right">Besar</TableHead>
                <TableHead className="text-right">Menengah</TableHead>
                <TableHead className="text-right">Kecil</TableHead>
                <TableHead className="text-right">Rata-rata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(h => {
                const kom = komoditas.find(k => k.id === h.komoditas_id);
                const pas = pasar.find(p => p.id === h.pasar_id);
                return (
                  <TableRow key={h.id} className="cursor-pointer hover:bg-accent/5" onClick={() => setDetailId(h.id)}>
                    <TableCell className="text-sm">{h.tanggal}</TableCell>
                    <TableCell className="font-medium text-sm">{kom?.nama || '-'}</TableCell>
                    <TableCell className="text-sm">{pas?.nama || '-'}</TableCell>
                    <TableCell className="text-right text-sm">{h.harga_besar != null ? `Rp ${h.harga_besar.toLocaleString('id-ID')}` : '-'}</TableCell>
                    <TableCell className="text-right text-sm">{h.harga_menengah != null ? `Rp ${h.harga_menengah.toLocaleString('id-ID')}` : '-'}</TableCell>
                    <TableCell className="text-right text-sm">{h.harga_kecil != null ? `Rp ${h.harga_kecil.toLocaleString('id-ID')}` : '-'}</TableCell>
                    <TableCell className="text-right font-bold text-accent text-sm">Rp {h.harga_rata_rata.toLocaleString('id-ID')}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detail Harga Pelaporan</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <span className="text-muted-foreground">Komoditas</span><span className="font-medium">{detailKom?.nama}</span>
                <span className="text-muted-foreground">Pasar</span><span className="font-medium">{detailPas?.nama}</span>
                <span className="text-muted-foreground">Tanggal</span><span className="font-medium">{detail.tanggal}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Kelas Besar</span>
                  <span className="font-medium text-sm">{detail.harga_besar != null ? `Rp ${detail.harga_besar.toLocaleString('id-ID')}` : '-'}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Kelas Menengah</span>
                  <span className="font-medium text-sm">{detail.harga_menengah != null ? `Rp ${detail.harga_menengah.toLocaleString('id-ID')}` : '-'}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Kelas Kecil</span>
                  <span className="font-medium text-sm">{detail.harga_kecil != null ? `Rp ${detail.harga_kecil.toLocaleString('id-ID')}` : '-'}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <span className="font-semibold text-sm">Rata-rata</span>
                  <span className="font-bold text-accent">Rp {detail.harga_rata_rata.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
