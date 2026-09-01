export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const TOKEN = process.env.NOTION_TOKEN;

  // Base "💡 Suggestions Nadège" — SÉPARÉE du CRM de prospection.
  // Les suggestions de Nadège n'atterrissent plus dans la base Contacts.
  const SUGGESTIONS_DB = '54df55d5-45f9-48ca-b240-8a14bdcda392';

  const { brand, sector, reason } = req.body;
  if (!brand) return res.status(400).json({ error: 'Nom requis' });

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: SUGGESTIONS_DB },
        properties: {
          Marque: { title: [{ text: { content: brand } }] },
          Secteur: { rich_text: [{ text: { content: sector || '' } }] },
          Pourquoi: { rich_text: [{ text: { content: reason || '' } }] },
          Statut: { select: { name: 'À traiter' } },
        },
      }),
    });

    const data = await response.json();
    if (data.object === 'error') throw new Error(data.message);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
