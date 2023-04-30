export async function query<R>(
  q: string,
  auth: string
): Promise<{ data: R; error: unknown }> {
  return fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: auth,
      'User-Agent': 'CF Worker',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: q,
    }),
  }).then((res) => res.json());
}
