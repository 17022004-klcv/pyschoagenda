import { Timestamp } from "firebase/firestore";

export type CategoryStatus = "active" | "inactive";

export interface TherapyCategory {
  id: string;
  name: string;
  status: CategoryStatus;
  createdAt: string;
}

export interface TherapyCategoryDocument {
  name: string;
  status: CategoryStatus;
  createdAt: Timestamp;
}

export interface TherapyCategoryFormData {
  name: string;
  status: CategoryStatus;
}
