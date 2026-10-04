"use client";
import { useMainCategories } from "./hooks/useMainCategories";
import CategoriesTable from "./components/CategoriesTable";
import AddModal from "./components/AddModal";
import EditModal from "./components/EditModal";
import DeleteModal from "./components/DeleteModal";

export default function MainCategoriesPage() {
  const {
    categories,
    filtered,
    search,
    setSearch,
    initialLoading,
    fetchError,
    fetchCategories,
    showModal,
    setShowModal,
    name,
    setName,
    error,
    setError,
    loading,
    handleAdd,
    editCat,
    setEditCat,
    editName,
    setEditName,
    editError,
    setEditError,
    editLoading,
    handleEdit,
    confirmDelete,
    setConfirmDelete,
    deleteLoading,
    confirmDeleteAction,
  } = useMainCategories();

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            التصنيفات الرئيسية
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            إدارة التصنيفات الرئيسية للمنتجات وعرض إحصائياتها
          </p>
        </div>
        <button
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium whitespace-nowrap shadow-sm hover:shadow transition-all"
        >
          + إضافة تصنيف
        </button>
      </div>

      <CategoriesTable
        categories={categories}
        filtered={filtered}
        search={search}
        loading={initialLoading}
        error={fetchError}
        onRetry={() => fetchCategories()}
        onSearchChange={setSearch}
        onEdit={(cat) => {
          setEditCat(cat);
          setEditName(cat.name);
          setEditError("");
        }}
        onDelete={(cat) => setConfirmDelete(cat)}
      />

      {showModal && (
        <AddModal
          name={name}
          error={error}
          loading={loading}
          onNameChange={setName}
          onSubmit={handleAdd}
          onClose={() => {
            setShowModal(false);
            setName("");
            setError("");
          }}
        />
      )}

      {editCat && (
        <EditModal
          editCat={editCat}
          editName={editName}
          editError={editError}
          editLoading={editLoading}
          onNameChange={setEditName}
          onSubmit={handleEdit}
          onClose={() => {
            setEditCat(null);
            setEditError("");
          }}
        />
      )}

      {confirmDelete && (
        <DeleteModal
          cat={confirmDelete}
          loading={deleteLoading}
          onConfirm={confirmDeleteAction}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
