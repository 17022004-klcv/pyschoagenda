"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Trash2,
  Database,
  User,
  Clock,
  Loader2,
} from "lucide-react";
import { AuditLogUI, AuditAction, AuditCollection } from "@/types/auditLog";
import { auditService } from "@/services/audit.service";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogUI[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "ALL">("ALL");
  const [collectionFilter, setCollectionFilter] = useState<
    AuditCollection | "ALL"
  >("ALL");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getLogs();
      setLogs(data);
    } catch (error) {
      console.error("Error cargando bitácora:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.performedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.documentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    const matchesCollection =
      collectionFilter === "ALL" || log.collectionName === collectionFilter;

    return matchesSearch && matchesAction && matchesCollection;
  });

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case "INSERT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
            <PlusCircle className="w-3.5 h-3.5" />
            INSERT
          </span>
        );
      case "UPDATE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
            <RefreshCw className="w-3.5 h-3.5" />
            UPDATE
          </span>
        );
      case "DELETE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            <Trash2 className="w-3.5 h-3.5" />
            DELETE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-0">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Bitácora de Auditoría
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
            Registro histórico de inserciones, actualizaciones y eliminaciones
            del sistema.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="self-start sm:self-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </button>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por usuario, detalles o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as any)}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-gray-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">
            Todas las acciones (INSERT / UPDATE / DELETE)
          </option>
          <option value="INSERT">Solo Inserciones (INSERT)</option>
          <option value="UPDATE">Solo Modificaciones (UPDATE)</option>
          <option value="DELETE">Solo Eliminaciones (DELETE)</option>
        </select>

        <select
          value={collectionFilter}
          onChange={(e) => setCollectionFilter(e.target.value as any)}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-gray-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">Todas las colecciones</option>
          <option value="appointments">appointments</option>
          <option value="expedients">expedients</option>
          <option value="patients">patients</option>
          <option value="sessions">sessions</option>
          <option value="therapy_categories">therapy_categories</option>
          <option value="users">users</option>
        </select>
      </div>

      {/* Tabla de Registros */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-500 dark:text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando eventos de auditoría...
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-4">Acción</th>
                  <th className="p-4">Colección</th>
                  <th className="p-4">Usuario Responsable</th>
                  <th className="p-4">Detalle del Evento</th>
                  <th className="p-4">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50 text-gray-700 dark:text-slate-300">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      No se encontraron registros de auditoría.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-4">{getActionBadge(log.action)}</td>
                      <td className="p-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 font-bold">
                          {log.collectionName}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {log.performedBy.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {log.performedBy.email}
                        </div>
                      </td>
                      <td className="p-4 max-w-xs font-medium">
                        {log.details}
                        {log.documentId && (
                          <span className="block text-[10px] font-mono text-gray-400 mt-0.5">
                            ID: {log.documentId}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5" />
                        {log.timestamp}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
