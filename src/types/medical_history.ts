export interface SessionItem {
  id: string;
  expedientCode: string;
  patientName: string;
  therapyType: string;
  date: string; // Formato YYYY-MM-DD
}

export interface ClinicalHistoryProps {
  sessions: SessionItem[];
  therapyOptions: { label: string; value: string }[];
  onDownloadPdf: (pdfType: "detail" | "proof", session: SessionItem) => void;
}
