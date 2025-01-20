class Store {
  private users: Map<string, any>;
  private documents: Map<string, any>;
  private static instance: Store;

  private constructor() {
    this.users = new Map();
    this.documents = new Map();
  }

  static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  // User methods
  async createUser(userData: any) {
    const id = Math.random().toString(36).substr(2, 9);
    const user = { id, ...userData, createdAt: new Date(), lastLogin: new Date() };
    this.users.set(id, user);
    return user;
  }

  async findUserByEmail(email: string) {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async findUserById(id: string) {
    return this.users.get(id);
  }

  // Document methods
  async createDocument(documentData: any) {
    const id = Math.random().toString(36).substr(2, 9);
    const document = {
      id,
      ...documentData,
      version: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async findDocumentById(id: string) {
    return this.documents.get(id);
  }

  async updateDocument(id: string, update: any) {
    const document = this.documents.get(id);
    if (!document) return null;
    
    const updated = {
      ...document,
      ...update,
      updatedAt: new Date(),
      version: document.version + 1
    };
    this.documents.set(id, updated);
    return updated;
  }

  async findDocumentsByUserId(userId: string) {
    return Array.from(this.documents.values()).filter(
      doc => doc.owner === userId || doc.collaborators.includes(userId)
    );
  }

  async addCollaborator(documentId: string, userId: string) {
    const document = this.documents.get(documentId);
    if (!document) return null;

    if (!document.collaborators.includes(userId)) {
      document.collaborators.push(userId);
      this.documents.set(documentId, document);
    }
    return document;
  }
}

export const store = Store.getInstance();