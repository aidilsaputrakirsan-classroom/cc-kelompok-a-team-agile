import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { useData } from "@/contexts/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ArrowRight,
  Building2,
  LogIn,
  MapPin,
  Minus,
  Package,
  Search,
  Store,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type SearchRow = {
  key: string;
  title: string;
  subtitle: string;
  price?: number;
  unit?: string;
  link?: string;
};

export default function LandingPage() {
  const { pasar, komoditas, tempatUsaha, hargaPelaporan } = useData();
  const [query, setQuery] = useState("");
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [heroApi, setHeroApi] = useState<CarouselApi | null>(null);
  const [selectedTrendKomoditasIds, setSelectedTrendKomoditasIds] = useState<
    string[]
  >([]);

  const formatTanggal = (tanggal: string) => {
    const date = new Date(tanggal);
    if (Number.isNaN(date.getTime())) return tanggal;
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    const interval = window.setInterval(() => carouselApi.scrollNext(), 4200);
    return () => window.clearInterval(interval);
  }, [carouselApi]);

  useEffect(() => {
    if (!heroApi) return;
    const interval = window.setInterval(() => heroApi.scrollNext(), 5200);
    return () => window.clearInterval(interval);
  }, [heroApi]);

  const stats = [
    { label: "Komoditas", value: komoditas.length, icon: Package },
    {
      label: "Pasar",
      value: pasar.filter((p) => p.is_active).length,
      icon: Store,
    },
    {
      label: "Tempat Usaha",
      value: tempatUsaha.filter((t) => t.is_active).length,
      icon: Building2,
    },
  ];

  const latestByKomoditas = useMemo(() => {
    return hargaPelaporan.reduce<
      Record<string, (typeof hargaPelaporan)[number]>
    >((acc, item) => {
      if (
        !acc[item.komoditas_id] ||
        item.tanggal > acc[item.komoditas_id].tanggal
      ) {
        acc[item.komoditas_id] = item;
      }
      return acc;
    }, {});
  }, [hargaPelaporan]);

  const summaryCards = useMemo(() => {
    return komoditas.map((k) => {
      const entries = hargaPelaporan
        .filter((h) => h.komoditas_id === k.id)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

      const latest = entries[entries.length - 1];
      const prev = entries[entries.length - 2];

      let trend: "naik" | "turun" | "stabil" = "stabil";
      let diff = 0;
      let pct = 0;
      if (latest && prev) {
        diff = latest.harga_rata_rata - prev.harga_rata_rata;
        pct =
          prev.harga_rata_rata > 0 ? (diff / prev.harga_rata_rata) * 100 : 0;
        trend = diff > 0 ? "naik" : diff < 0 ? "turun" : "stabil";
      }
      return { komoditas: k, latest, trend, diff, pct };
    });
  }, [komoditas, hargaPelaporan]);

  const trendCards = useMemo(() => {
    return summaryCards
      .filter(({ latest }) => latest)
      .sort((a, b) => b.latest!.tanggal.localeCompare(a.latest!.tanggal));
  }, [summaryCards]);

  useEffect(() => {
    if (trendCards.length === 0) {
      if (selectedTrendKomoditasIds.length !== 0) {
        setSelectedTrendKomoditasIds([]);
      }
      return;
    }

    setSelectedTrendKomoditasIds((prev) => {
      const validPrev = prev.filter((id) =>
        trendCards.some((card) => card.komoditas.id === id),
      );
      if (validPrev.length > 0) return validPrev.slice(0, 4);
      return trendCards.slice(0, 3).map((card) => card.komoditas.id);
    });
  }, [trendCards]);

  const selectedTrendCards = useMemo(() => {
    const ids =
      selectedTrendKomoditasIds.length > 0
        ? selectedTrendKomoditasIds
        : trendCards.slice(0, 3).map((card) => card.komoditas.id);

    return ids
      .map((id) => trendCards.find((card) => card.komoditas.id === id))
      .filter((card): card is NonNullable<typeof card> => card !== undefined)
      .slice(0, 4);
  }, [selectedTrendKomoditasIds, trendCards]);

  const selectedTrendSeries = useMemo(() => {
    return selectedTrendCards.map((card) => {
      const series = hargaPelaporan
        .filter((item) => item.komoditas_id === card.komoditas.id)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
        .map((item) => ({ tanggal: item.tanggal, harga: item.harga_rata_rata }))
        .slice(-8);

      return {
        id: card.komoditas.id,
        nama: card.komoditas.nama,
        satuan: card.komoditas.satuan_dasar,
        series,
      };
    });
  }, [hargaPelaporan, selectedTrendCards]);

  const trendChartDates = useMemo(() => {
    const dates = new Set<string>();
    selectedTrendSeries.forEach((item) => {
      item.series.forEach((point) => dates.add(point.tanggal));
    });
    return Array.from(dates).sort();
  }, [selectedTrendSeries]);

  const trendPalette = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--success))",
    "hsl(var(--info))",
  ];

  const trendChartStats = useMemo(() => {
    const allPrices = selectedTrendSeries.flatMap((item) =>
      item.series.map((point) => point.harga),
    );
    if (allPrices.length === 0) return null;

    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const spread = max - min;

    return {
      min,
      max,
      spread,
    };
  }, [selectedTrendSeries]);

  const trendChartConfig = useMemo(() => {
    return selectedTrendSeries.reduce<Record<string, { label: string }>>(
      (acc, item) => {
        acc[item.id] = { label: item.nama };
        return acc;
      },
      {},
    );
  }, [selectedTrendSeries]);

  const trendChartData = useMemo(() => {
    return trendChartDates.map((tanggal) => {
      const row: Record<string, number | string> = { tanggal };
      selectedTrendSeries.forEach((item) => {
        const point = item.series.find(
          (seriesPoint) => seriesPoint.tanggal === tanggal,
        );
        if (point) row[item.id] = point.harga;
      });
      return row;
    });
  }, [trendChartDates, selectedTrendSeries]);

  const toggleTrendKomoditas = (id: string) => {
    setSelectedTrendKomoditasIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 4) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const overallCards = useMemo(() => {
    return komoditas.map((k) => {
      const entries = hargaPelaporan
        .filter((h) => h.komoditas_id === k.id)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

      const latest = entries[entries.length - 1];
      const prices = entries
        .map((e) => e.harga_rata_rata)
        .filter((price) => price > 0);
      const avgPrice =
        prices.length > 0
          ? Math.round(
              prices.reduce((total, value) => total + value, 0) / prices.length,
            )
          : 0;
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      return {
        komoditas: k,
        latest,
        avgPrice,
        minPrice,
        maxPrice,
      };
    });
  }, [komoditas, hargaPelaporan]);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [] as SearchRow[];

    return komoditas
      .filter((k) => k.nama.toLowerCase().includes(normalized))
      .map((k) => {
        const latest = latestByKomoditas[k.id];
        return {
          key: `kom-${k.id}`,
          title: k.nama,
          subtitle: latest ? `Update ${latest.tanggal}` : "Belum ada data",
          price: latest?.harga_rata_rata,
          unit: k.satuan_dasar,
        };
      })
      .slice(0, 8);
  }, [
    query,
    komoditas,
    latestByKomoditas,
  ]);

  const heroSlides = [
    {
      title: "Harga Komoditas",
      subtitle: "Pantau pergerakan harga harian dengan cepat",
    },
    {
      title: "Pasar Aktif",
      subtitle: "Data pasar terhubung langsung dengan petugas",
    },
    {
      title: "Tempat Usaha",
      subtitle: "Harga pedagang terkelola dan terverifikasi",
    },
  ];

  const mapCenter = useMemo(() => {
    const first = pasar.find((p) => p.is_active && p.latitude && p.longitude);
    if (first) return [first.latitude, first.longitude] as [number, number];
    return [-6.9147, 107.5731] as [number, number];
  }, [pasar]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <span className="text-lg font-display font-semibold text-primary tracking-tight">
            SIHP
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <LogIn className="h-4 w-4 mr-1.5" /> Masuk
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="hero-sheen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 text-primary text-xs uppercase tracking-[0.3em]">
              Sistem Informasi Harga Pangan
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold leading-tight">
              Harga pangan yang jelas, cepat, dan selalu terkini.
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
              Cari komoditas untuk melihat harga rata-rata terbaru. Semua data
              dirangkum agar mudah dipahami.
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari komoditas"
                className="pl-10 h-11 bg-background"
              />
            </div>
            {query.trim() && (
              <div className="grid gap-3 sm:grid-cols-2">
                {searchResults.length > 0 ? (
                  searchResults.map((row) => (
                    <Card
                      key={row.key}
                      className="group hover:shadow-lg transition-all hover:-translate-y-0.5"
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              {row.subtitle}
                            </p>
                            <h3 className="font-semibold">{row.title}</h3>
                          </div>
                          <div className="h-8 w-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                            <Package className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="text-primary font-semibold">
                          {row.price
                            ? `Rp ${row.price.toLocaleString("id-ID")}`
                            : "Belum ada harga"}
                          {row.unit ? ` / ${row.unit}` : ""}
                        </p>
                        {row.link && (
                          <Link
                            to={row.link}
                            className="text-xs text-primary inline-flex items-center gap-1"
                          >
                            Lihat tempat usaha{" "}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      Tidak ada data untuk kata kunci tersebut.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            {/* masuk dashboard and jelajahi data */}
            {/* <div className="flex flex-wrap items-center gap-3">
              <Link to="/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Masuk Dashboard
                </Button>
              </Link>
              <Link to="/public/komoditas">
                <Button
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  Jelajahi Data
                </Button>
              </Link>
            </div> */}
          </div>

          <Card className="glass-frame overflow-hidden animate-float">
            <CardContent className="p-0">
              <Carousel opts={{ loop: true }} setApi={setHeroApi}>
                <CarouselContent>
                  {heroSlides.map((slide) => (
                    <CarouselItem key={slide.title}>
                      <div className="h-64 sm:h-80 p-6 flex flex-col justify-between">
                        <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
                            Highlight
                          </p>
                          <h3 className="text-2xl font-display font-semibold">
                            {slide.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            {slide.subtitle}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card
              key={s.label}
              className="hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <CardContent className="p-5 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{s.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Komoditas
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold">
              Tren Harga Komoditas
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Klik chip komoditas untuk menampilkan atau menyembunyikan garis.
              Hover pada titik untuk melihat nilai harga per tanggal.
            </p>
          </div>
          <Link
            to="/public/komoditas"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            Buka dashboard komoditas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Card className="relative overflow-hidden border border-white/60 bg-white/70 shadow-[0_24px_70px_-48px_hsl(var(--foreground)/0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/35">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.08),transparent_34%),radial-gradient(circle_at_90%_15%,hsl(var(--accent)/0.1),transparent_32%)]" />
          <CardContent className="p-4 sm:p-5 space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-wrap gap-2">
                {trendCards.slice(0, 10).map((card, index) => {
                  const isActive = selectedTrendKomoditasIds.includes(
                    card.komoditas.id,
                  );
                  return (
                    <button
                      key={card.komoditas.id}
                      type="button"
                      onClick={() => toggleTrendKomoditas(card.komoditas.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all ${
                        isActive
                          ? "border-transparent shadow-md ring-1 ring-offset-1"
                          : "border-border bg-background/50 text-muted-foreground hover:border-border/80 hover:bg-background/80 hover:text-foreground"
                      }`}
                      style={{
                        animationDelay: `${index * 40}ms`,
                        ...(isActive && {
                          backgroundColor: `${trendPalette[index % trendPalette.length]}15`,
                          borderColor:
                            trendPalette[index % trendPalette.length],
                          color: trendPalette[index % trendPalette.length],
                        }),
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full ring-1 ring-white/40"
                        style={{
                          backgroundColor:
                            trendPalette[index % trendPalette.length],
                        }}
                      />
                      {card.komoditas.nama}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border bg-background px-3 py-1">
                  {selectedTrendCards.length} dipilih
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() =>
                    setSelectedTrendKomoditasIds(
                      trendCards.slice(0, 3).map((card) => card.komoditas.id),
                    )
                  }
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/70 bg-white/60 p-4 shadow-[0_18px_42px_-32px_hsl(var(--foreground)/0.45)] backdrop-blur-xl sm:p-5 dark:border-white/10 dark:bg-slate-900/25">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      Multi-line overview
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      {selectedTrendCards.length > 0
                        ? "Harga komoditas terpilih"
                        : "Pilih komoditas untuk mulai"}
                    </h3>
                  </div>
                  {trendChartStats && (
                    <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                      Rentang {trendChartStats.spread.toLocaleString("id-ID")}
                    </div>
                  )}
                </div>

                <div className="mt-4 aspect-[16/9] overflow-hidden rounded-3xl border border-white/70 bg-background/95 shadow-inner dark:border-white/10">
                  {trendChartData.length > 0 &&
                  selectedTrendSeries.length > 0 ? (
                    <ChartContainer
                      config={trendChartConfig}
                      className="h-full w-full p-2 sm:p-3"
                    >
                      <LineChart
                        data={trendChartData}
                        margin={{ top: 8, right: 12, left: 12, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="4 4" vertical={false} />
                        <XAxis
                          dataKey="tanggal"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          minTickGap={24}
                          tickFormatter={(value) => String(value).slice(5)}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          width={62}
                          tickFormatter={(value) =>
                            Number(value).toLocaleString("id-ID")
                          }
                        />
                        <ChartTooltip
                          cursor={{
                            stroke: "hsl(var(--border))",
                            strokeDasharray: "3 3",
                          }}
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0)
                              return null;
                            return (
                              <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">
                                  Tanggal: {label}
                                </p>
                                <div className="space-y-1.5">
                                  {payload.map((entry, index) => (
                                    <div
                                      key={`item-${index}`}
                                      className="flex items-center justify-between gap-3"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span
                                          className="h-2 w-2 rounded-full shrink-0"
                                          style={{
                                            backgroundColor: entry.color,
                                          }}
                                        />
                                        <span className="text-xs font-medium text-foreground truncate">
                                          {entry.name ??
                                            trendChartConfig[String(entry.dataKey)]
                                              ?.label ??
                                            String(entry.dataKey)}
                                        </span>
                                      </div>
                                      <span className="text-xs font-bold text-foreground whitespace-nowrap">
                                        Rp{" "}
                                        {Number(entry.value).toLocaleString(
                                          "id-ID",
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }}
                        />
                        {selectedTrendSeries.map((item, index) => (
                          <Line
                            key={item.id}
                            type="monotone"
                            dataKey={item.id}
                            name={item.nama}
                            stroke={trendPalette[index % trendPalette.length]}
                            strokeWidth={2.2}
                            dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                            activeDot={{ r: 6, strokeWidth: 2 }}
                            connectNulls
                            isAnimationActive={false}
                          />
                        ))}
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
                      Pilih komoditas untuk melihat grafik.
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {selectedTrendSeries.map((seriesItem, seriesIndex) => {
                    const latestPoint =
                      seriesItem.series[seriesItem.series.length - 1];
                    const firstPoint = seriesItem.series[0];
                    const delta =
                      latestPoint && firstPoint
                        ? latestPoint.harga - firstPoint.harga
                        : 0;
                    const deltaPct = firstPoint?.harga
                      ? (delta / firstPoint.harga) * 100
                      : 0;
                    const color =
                      trendPalette[seriesIndex % trendPalette.length];
                    const isTrendingUp = delta > 0;
                    const isTrendingDown = delta < 0;

                    return (
                      <div
                        key={`legend-${seriesItem.id}`}
                        className="group rounded-2xl border border-border/60 bg-background/50 backdrop-blur-sm px-3.5 py-3 transition-all duration-200 hover:border-primary/40 hover:bg-background/80 hover:shadow-lg dark:hover:bg-slate-800/60"
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span
                              className="h-3 w-3 rounded-full shrink-0 ring-1 ring-white/30"
                              style={{ backgroundColor: color }}
                            />
                            <span className="truncate font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                              {seriesItem.nama}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isTrendingUp ? (
                              <TrendingUp className="h-3.5 w-3.5 text-danger" />
                            ) : isTrendingDown ? (
                              <TrendingDown className="h-3.5 w-3.5 text-success" />
                            ) : (
                              <Minus className="h-3.5 w-3.5 text-warning" />
                            )}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-sm font-bold text-primary">
                            {latestPoint
                              ? `Rp ${latestPoint.harga.toLocaleString("id-ID")}`
                              : "-"}
                          </p>
                          {latestPoint && firstPoint && (
                            <p
                              className={`text-xs font-semibold ${
                                isTrendingUp
                                  ? "text-danger"
                                  : isTrendingDown
                                    ? "text-success"
                                    : "text-warning"
                              }`}
                            >
                              {isTrendingUp || isTrendingDown
                                ? `${isTrendingUp ? "+" : ""}${deltaPct.toFixed(1)}%`
                                : "0%"}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Komoditas
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold">
              Harga Komoditas Keseluruhan
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Gambaran periode data: rata-rata, dan rentang minimum-maksimum.
            </p>
          </div>
          <Link
            to="/public/komoditas"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            Lihat Dashboard Komoditas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          setApi={setCarouselApi}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {overallCards.map(
              ({ komoditas: k, latest, avgPrice, minPrice, maxPrice }) => {
                return (
                  <CarouselItem
                    key={k.id}
                    className="pl-3 basis-11/12 sm:basis-1/2 lg:basis-1/3"
                  >
                    <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-0.5">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              {k.satuan_dasar}
                            </p>
                            <h3 className="font-semibold">{k.nama}</h3>
                          </div>
                          <div className="h-9 w-9 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                            <Package className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="text-xl font-semibold text-primary">
                          {avgPrice > 0
                            ? `Rp ${avgPrice.toLocaleString("id-ID")}`
                            : "Belum ada data"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {latest
                            ? `Data terakhir ${formatTanggal(latest.tanggal)}`
                            : ""}
                        </p>
                        <div className="space-y-1.5 text-xs">
                          <p className="text-muted-foreground">
                            Rentang:{" "}
                            {minPrice > 0
                              ? `Rp ${minPrice.toLocaleString("id-ID")}`
                              : "-"}{" "}
                            -{" "}
                            {maxPrice > 0
                              ? `Rp ${maxPrice.toLocaleString("id-ID")}`
                              : "-"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              },
            )}
          </CarouselContent>
        </Carousel>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Peta Pasar
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold">
              Lokasi Pasar & Tempat Usaha
            </h2>
          </div>
          <div className="text-xs text-muted-foreground">
            Klik marker pasar untuk melihat tempat usaha
          </div>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={false}
            className="h-[420px] w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pasar
              .filter((p) => p.is_active && p.latitude && p.longitude)
              .map((p) => {
                const pasarTempatUsaha = tempatUsaha.filter(
                  (t) => t.pasar_id === p.id && t.is_active,
                );
                return (
                  <Marker key={p.id} position={[p.latitude, p.longitude]}>
                    <Popup>
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold">{p.nama}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.alamat}
                          </p>
                        </div>
                        <div className="space-y-1">
                          {pasarTempatUsaha.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              Belum ada tempat usaha
                            </p>
                          )}
                          {pasarTempatUsaha.map((t) => (
                            <Link
                              key={t.id}
                              to={`/public/tempat-usaha/${t.id}`}
                              className="text-xs text-primary inline-flex items-center gap-1"
                            >
                              {t.nama} <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        (c) {new Date().getFullYear()} Sistem Informasi Harga Pangan
      </footer>
    </div>
  );
}
