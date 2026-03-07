import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/catalog/search", async (req, res) => {
    const { q, constellation, catalog } = req.query;
    
    try {
      const catalogsToSearch = catalog ? [catalog] : ['messier', 'ngc', 'ic', 'melotte', 'caldwell', 'wds', 'hr'];
      let results: any[] = [];

      for (const cat of catalogsToSearch) {
        const filePath = path.join(__dirname, 'data', 'catalogs', `${cat}.json`);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          let filtered = data;
          
          if (constellation) {
            filtered = filtered.filter((obj: any) => 
              obj.constellation && obj.constellation.toLowerCase() === (constellation as string).toLowerCase()
            );
          }
          
          if (q) {
            const lowerQ = (q as string).toLowerCase();
            filtered = filtered.filter((obj: any) => 
              (obj.id && obj.id.toLowerCase().includes(lowerQ)) ||
              (obj.name && obj.name.toLowerCase().includes(lowerQ))
            );
          }
          
          results = results.concat(filtered);
        } catch (e) {
          // Skip missing catalogs
        }
      }

      res.json(results.slice(0, 100)); // Limit results
    } catch (error) {
      res.status(500).json({ error: "Failed to search catalog" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
