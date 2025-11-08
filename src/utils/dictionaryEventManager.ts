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

  public addTerm(term: { term: string; explanation: string; longDescription?: string; gender?: string; category?: string }): boolean {
    try {
      // Get existing dictionary terms
      const existingTermsJson = localStorage.getItem('dictionaryTerms');
      const existingTerms = existingTermsJson ? JSON.parse(existingTermsJson) : [];
      
      // Check if term already exists
      const termExists = existingTerms.some((existing: any) => 
        existing.term.toLowerCase() === term.term.toLowerCase()
      );
      
      if (!termExists) {
        // Add new term (only short description goes to main dictionary)
        const updatedTerms = [...existingTerms, { term: term.term, explanation: term.explanation }];
        localStorage.setItem('dictionaryTerms', JSON.stringify(updatedTerms));
        
        // If there's a long description, save it to extended descriptions
        if (term.longDescription) {
          this.saveExtendedDescription({
            term: term.term,
            shortDescription: term.explanation,
            longDescription: term.longDescription,
            category: term.category || 'Other',
            gender: term.gender,
            lastUpdated: Date.now()
          });
        }
        
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

  public updateExtendedDescription(term: string, longDescription: string, category?: string, gender?: string): boolean {
    try {
      const stored = localStorage.getItem('extendedDescriptions');
      const descriptions = stored ? JSON.parse(stored) : {};
      
      const termLower = term.toLowerCase();
      
      // Get the short description from main dictionary
      const dictionaryTerms = this.getTerms();
      const dictTerm = dictionaryTerms.find(t => t.term.toLowerCase() === termLower);
      
      if (descriptions[termLower]) {
        // Update existing extended description
        descriptions[termLower].longDescription = longDescription;
        descriptions[termLower].lastUpdated = Date.now();
        if (gender) descriptions[termLower].gender = gender;
        if (category) descriptions[termLower].category = category;
      } else {
        // Create new extended description
        descriptions[termLower] = {
          term: term,
          shortDescription: dictTerm?.explanation || '',
          longDescription: longDescription,
          category: category || 'Other',
          gender: gender,
          lastUpdated: Date.now()
        };
      }
      
      localStorage.setItem('extendedDescriptions', JSON.stringify(descriptions));
      this.notifyUpdate();
      return true;
    } catch (error) {
      console.error('Failed to update extended description:', error);
      return false;
    }
  }

  private saveExtendedDescription(description: any): void {
    try {
      const stored = localStorage.getItem('extendedDescriptions');
      const descriptions = stored ? JSON.parse(stored) : {};
      descriptions[description.term.toLowerCase()] = description;
      localStorage.setItem('extendedDescriptions', JSON.stringify(descriptions));
    } catch (error) {
      console.error('Failed to save extended description:', error);
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
