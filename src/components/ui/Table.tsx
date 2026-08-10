import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  itemsPerPage?: number;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  itemsPerPage = 5,
  emptyMessage = "No se encontraron registros.",
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Lógica de Paginación
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Asegurar que si la búsqueda reduce los datos, la página actual vuelva a 1
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [data.length, totalPages, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-3xl p-2 shadow-sm overflow-hidden font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display',sans-serif]">
      {/* Contenedor con scroll horizontal para móviles */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200/80 text-gray-400 text-xs font-bold uppercase tracking-wider">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`py-3.5 px-5 ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60 text-sm">
            {currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-400 font-medium text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="bg-white hover:bg-gray-50/80 transition-colors"
                >
                  {columns.map((col, index) => (
                    <td
                      key={index}
                      className={`py-4 px-5 ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left"
                      }`}
                    >
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 PAGINACIÓN SENCILLA Y MINIMALISTA */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200/60 bg-white/50 text-xs text-gray-500 font-medium rounded-b-2xl">
          <span>
            Mostrando{" "}
            <strong className="text-gray-800">
              {startIndex + 1}-{Math.min(endIndex, data.length)}
            </strong>{" "}
            de <strong className="text-gray-800">{data.length}</strong>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-gray-200/80 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-gray-700">
              {currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-xl border border-gray-200/80 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Página Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
