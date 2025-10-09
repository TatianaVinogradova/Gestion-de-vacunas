import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface VaccinationDocument {
    id: string;
    url: string;
    name: string;
    uploadDate: Date;
    type: 'photo' | 'file';
}

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private documentsSubject = new BehaviorSubject<VaccinationDocument[]>([]);
    public documents$ = this.documentsSubject.asObservable();
  
    private idCounter = 0;

    addDocument(url: string, type: 'photo' | 'file'): void {
        const currentDocs = this.documentsSubject.value;
        const newDoc: VaccinationDocument = {
          id: `doc-${this.idCounter++}-${Date.now()}`,
          url: url,
          name: type === 'photo' ? `Foto ${currentDocs.length + 1}` : `Documento ${currentDocs.length + 1}`,
          uploadDate: new Date(),
          type: type
        };
        this.documentsSubject.next([...currentDocs, newDoc]);
      }
    
      removeDocument(id: string): void {
        const currentDocs = this.documentsSubject.value;
        this.documentsSubject.next(currentDocs.filter(doc => doc.id !== id));
    }
  
    getDocuments(): VaccinationDocument[] {
      return this.documentsSubject.value;
    }
    clearAllDocuments(): void {
        this.documentsSubject.next([]);
      }
    }