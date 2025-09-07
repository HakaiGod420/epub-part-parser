// Dictionary event manager to handle real-time updates
export class DictionaryEventManager {
  private listeners: Set<() => void> = new Set();

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  public notifyUpdate(): void {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in dictionary update listener:', error);
      }
    });
  }

  public addTerm(term: { term: string; explanation: string }): boolean {
    try {
      // Get existing dictionary terms
      const existingTermsJson = localStorage.getItem('dictionaryTerms');
      const existingTerms = existingTermsJson ? JSON.parse(existingTermsJson) : [];
      
      // Check if term already exists
      const termExists = existingTerms.some((existing: any) => 
        existing.term.toLowerCase() === term.term.toLowerCase()
      );
      
      if (!termExists) {
        // Add new term
        const updatedTerms = [...existingTerms, term];
        localStorage.setItem('dictionaryTerms', JSON.stringify(updatedTerms));
        
        // Notify all subscribers
        this.notifyUpdate();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add term to dictionary:', error);
      return false;
    }
  }

  public getTerms(): { term: string; explanation: string }[] {
    try {
      const existingTermsJson = localStorage.getItem('dictionaryTerms');
      if (!existingTermsJson) return [];
      
      const terms = JSON.parse(existingTermsJson);
      return Array.isArray(terms) ? terms : [];
    } catch (error) {
      console.error('Error getting dictionary terms:', error);
      return [];
    }
  }
}

export const dictionaryEventManager = new DictionaryEventManager();
