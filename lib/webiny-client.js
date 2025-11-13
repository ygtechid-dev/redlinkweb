// Webiny GraphQL API Client untuk RedLink
// ✅ Pakai proxy API route untuk bypass CORS
// ✅ Support auto-login dengan credentials

const WEBINY_API_URL = "/api/webiny"; // Proxy ke https://d112igt95wgees.cloudfront.net/graphql
const WEBINY_PAGE_BUILDER_URL = process.env.NEXT_PUBLIC_WEBINY_PAGE_BUILDER_URL || "https://d112igt95wgees.cloudfront.net/page-builder";

export class WebinyClient {
  constructor() {
    this.apiUrl = WEBINY_API_URL;
    this.pageBuilderUrl = WEBINY_PAGE_BUILDER_URL;
    this.authToken = null;
    this.tokenExpiry = null;
  }

  // ✅ Auto-login to Webiny
  async authenticate() {
    try {
      // Check if we already have a valid token
      if (this.authToken && this.tokenExpiry && new Date() < new Date(this.tokenExpiry)) {
        console.log("✅ Using cached auth token");
        return this.authToken;
      }

      console.log("🔐 Authenticating with Webiny...");
      
      const response = await fetch("/api/webiny/auth", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      this.authToken = data.token;
      this.tokenExpiry = data.expiresOn;

      console.log("✅ Authentication successful!");
      return this.authToken;
    } catch (error) {
      console.error("❌ Authentication failed:", error);
      // Don't throw, return null to allow fallback
      return null;
    }
  }

  // ✅ Clear cached auth token
  clearAuth() {
    this.authToken = null;
    this.tokenExpiry = null;
  }

  // ✅ Check if authenticated
  isAuthenticated() {
    return this.authToken && this.tokenExpiry && new Date() < new Date(this.tokenExpiry);
  }

  async request(query, variables = {}) {
    try {
      console.log("🚀 Sending request to proxy...");
      
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response not OK:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        console.error("❌ GraphQL Errors:", result.errors);
        throw new Error(result.errors[0].message);
      }

      console.log("✅ Request successful");
      return result.data;
    } catch (error) {
      console.error("🔥 Webiny Request Error:", error);
      throw error;
    }
  }

  // ✅ Create new page
  async createPage(title, username, category = "static") {
    const query = `
      mutation CreatePage($from: ID, $category: String, $meta: JSON) {
        pageBuilder {
          createPage(from: $from, category: $category, meta: $meta) {
            data {
              id
              pid
              title
              path
              url
              status
              version
              createdOn
              createdBy {
                id
                displayName
              }
            }
            error {
              message
              code
              data
            }
          }
        }
      }
    `;

    const variables = {
      category,
      meta: {
        title,
        description: `Landing page created by ${username}`,
        image: null,
        tags: ["redlink", "landing-page"],
      },
    };

    try {
      console.log("📝 Creating page with variables:", variables);
      const result = await this.request(query, variables);
      return result.pageBuilder.createPage;
    } catch (error) {
      console.error("❌ Failed to create page:", error);
      return {
        data: null,
        error: {
          message: error.message || "Failed to create page",
          code: "CREATE_PAGE_ERROR",
        },
      };
    }
  }

  // ✅ List pages
  async listPages(limit = 100, where = {}) {
    const query = `
      query ListPages($where: PbListPagesWhereInput, $limit: Int) {
        pageBuilder {
          listPages(where: $where, limit: $limit, sort: createdOn_DESC) {
            data {
              id
              pid
              title
              path
              url
              status
              locked
              version
              createdOn
              savedOn
              publishedOn
              createdBy {
                id
                displayName
              }
            }
            meta {
              cursor
              hasMoreItems
              totalCount
            }
            error {
              message
              code
            }
          }
        }
      }
    `;

    const variables = { where, limit };

    try {
      const result = await this.request(query, variables);
      return result.pageBuilder.listPages;
    } catch (error) {
      console.error("❌ Failed to list pages:", error);
      return {
        data: [],
        meta: { totalCount: 0 },
        error: {
          message: error.message || "Failed to list pages",
        },
      };
    }
  }

  // ✅ Get single page by ID
  async getPage(pageId) {
    const query = `
      query GetPage($id: ID!) {
        pageBuilder {
          getPage(id: $id) {
            data {
              id
              pid
              title
              path
              url
              status
              locked
              version
              content
              createdOn
              savedOn
              publishedOn
              createdBy {
                id
                displayName
              }
            }
            error {
              message
              code
            }
          }
        }
      }
    `;

    try {
      const result = await this.request(query, { id: pageId });
      return result.pageBuilder.getPage;
    } catch (error) {
      console.error("❌ Failed to get page:", error);
      return {
        data: null,
        error: {
          message: error.message || "Failed to get page",
        },
      };
    }
  }

  // ✅ Publish page
  async publishPage(pageId) {
    const query = `
      mutation PublishPage($id: ID!) {
        pageBuilder {
          publishPage(id: $id) {
            data {
              id
              pid
              status
              url
              publishedOn
            }
            error {
              message
              code
            }
          }
        }
      }
    `;

    try {
      const result = await this.request(query, { id: pageId });
      return result.pageBuilder.publishPage;
    } catch (error) {
      console.error("❌ Failed to publish page:", error);
      return {
        data: null,
        error: {
          message: error.message || "Failed to publish page",
        },
      };
    }
  }

  // ✅ Unpublish page
  async unpublishPage(pageId) {
    const query = `
      mutation UnpublishPage($id: ID!) {
        pageBuilder {
          unpublishPage(id: $id) {
            data {
              id
              status
            }
            error {
              message
              code
            }
          }
        }
      }
    `;

    try {
      const result = await this.request(query, { id: pageId });
      return result.pageBuilder.unpublishPage;
    } catch (error) {
      console.error("❌ Failed to unpublish page:", error);
      return {
        data: null,
        error: {
          message: error.message || "Failed to unpublish page",
        },
      };
    }
  }

  // ✅ Delete page
  async deletePage(pageId) {
    const query = `
      mutation DeletePage($id: ID!) {
        pageBuilder {
          deletePage(id: $id) {
            data
            error {
              message
              code
            }
          }
        }
      }
    `;

    try {
      const result = await this.request(query, { id: pageId });
      return result.pageBuilder.deletePage;
    } catch (error) {
      console.error("❌ Failed to delete page:", error);
      return {
        data: false,
        error: {
          message: error.message || "Failed to delete page",
        },
      };
    }
  }

  // ✅ Update page
  async updatePage(pageId, data) {
    const query = `
      mutation UpdatePage($id: ID!, $data: PbUpdatePageInput!) {
        pageBuilder {
          updatePage(id: $id, data: $data) {
            data {
              id
              title
              path
              url
              status
            }
            error {
              message
              code
            }
          }
        }
      }
    `;

    try {
      const result = await this.request(query, { id: pageId, data });
      return result.pageBuilder.updatePage;
    } catch (error) {
      console.error("❌ Failed to update page:", error);
      return {
        data: null,
        error: {
          message: error.message || "Failed to update page",
        },
      };
    }
  }

  // ✅ Generate editor URL with authentication
  async getEditorUrlWithAuth(pageId) {
    try {
      const token = await this.authenticate();
      
      if (token) {
        // Encode token untuk URL
        const encodedToken = encodeURIComponent(token);
        return `${this.pageBuilderUrl}/editor/${pageId}?token=${encodedToken}`;
      } else {
        // Fallback to regular URL if auth fails
        console.warn("⚠️ Using editor URL without auth token");
        return this.getEditorUrl(pageId);
      }
    } catch (error) {
      console.error("❌ Failed to get authenticated editor URL:", error);
      return this.getEditorUrl(pageId);
    }
  }

  // ✅ Generate regular editor URL (without auth)
  getEditorUrl(pageId) {
    return `${this.pageBuilderUrl}/editor/${pageId}`;
  }

  // ✅ Generate preview URL
  getPreviewUrl(pageUrl) {
    return pageUrl;
  }

  // ✅ Check if configured
  isConfigured() {
    return !!this.apiUrl;
  }

  // ✅ Health check
  async healthCheck() {
    const query = `
      query {
        pageBuilder {
          version
        }
      }
    `;

    try {
      const result = await this.request(query);
      return {
        success: true,
        version: result.pageBuilder?.version || "unknown",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ✅ List available categories
  async listCategories() {
    const query = `
      query ListCategories {
        pageBuilder {
          listCategories {
            data {
              slug
              name
              url
            }
            error {
              message
            }
          }
        }
      }
    `;

    try {
      const result = await this.request(query);
      return result.pageBuilder.listCategories;
    } catch (error) {
      console.error("❌ Failed to list categories:", error);
      return {
        data: [
          { slug: "static", name: "Static", url: "/static" },
          { slug: "root", name: "Root", url: "/" },
        ],
        error: {
          message: error.message || "Failed to list categories",
        },
      };
    }
  }

  // ✅ Get GraphQL Schema Info (untuk debug)
  async getSchemaInfo() {
    const query = `
      query {
        __type(name: "PbMutation") {
          name
          kind
          fields {
            name
            args {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;

    try {
      const result = await this.request(query);
      return result;
    } catch (error) {
      console.error("❌ Failed to get schema info:", error);
      return null;
    }
  }

  // ✅ Get current user info (if authenticated)
  async getCurrentUser() {
    const query = `
      query GetCurrentUser {
        security {
          getCurrentUser {
            data {
              id
              email
              displayName
              avatar {
                src
              }
            }
            error {
              message
            }
          }
        }
      }
    `;

    try {
      const result = await this.request(query);
      return result.security.getCurrentUser;
    } catch (error) {
      console.error("❌ Failed to get current user:", error);
      return {
        data: null,
        error: {
          message: error.message || "Failed to get current user",
        },
      };
    }
  }
}

// Export singleton instance
export const webinyClient = new WebinyClient();

// Export utility functions
export const webinyUtils = {
  // Format status untuk display
  formatStatus(status) {
    const statusMap = {
      draft: { label: "Draft", color: "yellow" },
      published: { label: "Published", color: "green" },
      unpublished: { label: "Unpublished", color: "gray" },
    };
    return statusMap[status] || { label: status, color: "gray" };
  },

  // Generate unique page path
  generatePath(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  },

  // Validate page title
  validateTitle(title) {
    if (!title || title.trim().length === 0) {
      return { valid: false, error: "Title cannot be empty" };
    }
    if (title.length > 100) {
      return { valid: false, error: "Title too long (max 100 characters)" };
    }
    return { valid: true };
  },

  // Format date
  formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime(dateString) {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return this.formatDate(dateString);
  },

  // Truncate text
  truncate(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  },

  // Get page status badge classes
  getStatusBadgeClasses(status) {
    const classes = {
      draft: "bg-yellow-100 text-yellow-700 border-yellow-200",
      published: "bg-green-100 text-green-700 border-green-200",
      unpublished: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return classes[status] || classes.unpublished;
  },
};

// Export class for custom instances
export { WebinyClient };