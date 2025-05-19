import { GraphQLClient, gql } from 'graphql-request';
import dotenv from 'dotenv';

dotenv.config();

const MONDAY_API_URL = 'https://api.monday.com/v2';
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

const client = new GraphQLClient(MONDAY_API_URL, {
  headers: {
    Authorization: MONDAY_API_TOKEN
  }
});

const getGroupsQuery = gql`
  query GetGroups($boardId: ID!) {
    boards(ids: [$boardId]) {
      groups {
        id
        title
      }
    }
  }
`;

const boardId = 'YOUR_BOARD_ID_HERE'; // replace with actual board ID

async function testGroupFetch() {
  console.log(`🔍 Fetching groups for board ID: ${boardId}`);
  try {
    const res = await client.request(getGroupsQuery, { boardId });
    const groups = res.boards?.[0]?.groups || [];
    console.log('✅ Groups:', groups);
  } catch (err) {
    console.error('❌ Error fetching groups:');
    if (err.response) {
      console.error(JSON.stringify(err.response, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

testGroupFetch();
