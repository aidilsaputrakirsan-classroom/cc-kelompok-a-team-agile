import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  checkHealth,
} from "./services/api";

function App() {
  // ==================== STATE ====================
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "name" | "price" | "newest"

  // ==================== LOAD DATA ====================
  const loadItems = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const data = await fetchItems(search);
      setItems(data.items);
      setTotalItems(data.total);
    } catch (err) {
      console.error("Error loading items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== ON MOUNT ====================
  useEffect(() => {
    // Cek koneksi API
    checkHealth().then(setIsConnected);
    // Load items
    loadItems();
  }, [loadItems]);

  // ==================== HANDLERS ====================

  const handleSubmit = async (itemData, editId) => {
    if (editId) {
      // Mode edit
      await updateItem(editId, itemData);
      setEditingItem(null);
    } else {
      // Mode create
      await createItem(itemData);
    }
    // Reload daftar items
    loadItems(searchQuery);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    // Scroll ke atas ke form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return;

    try {
      await deleteItem(id);
      loadItems(searchQuery);
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    loadItems(query);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // ==================== SORTING ====================
  const sortedItems = useMemo(() => {
    const sorted = [...items];
    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "price":
        return sorted.sort((a, b) => a.price - b.price);
      case "newest":
      default:
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
    }
  }, [items, sortBy]);

  // ==================== RENDER ====================
  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <Header totalItems={totalItems} isConnected={isConnected} />
        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={handleCancelEdit}
        />
        <SearchBar onSearch={handleSearch} />

        {/* Sorting Dropdown */}
        <div style={styles.sortContainer}>
          <label style={styles.sortLabel}>Urutkan berdasarkan:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.sortSelect}
          >
            <option value="newest">Terbaru</option>
            <option value="name">Nama (A-Z)</option>
            <option value="price">Harga (Terendah)</option>
          </select>
        </div>

        <ItemList
          items={sortedItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  sortContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1rem",
    padding: "0.75rem 1rem",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  sortLabel: {
    fontSize: "0.9rem",
    color: "#555",
    fontWeight: "500",
  },
  sortSelect: {
    padding: "0.5rem 1rem",
    fontSize: "0.9rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "#fff",
    cursor: "pointer",
    outline: "none",
  },
};

export default App;
