// src/services/mondayService.mjs
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const validateTokenQuery = gql`
  query {
    boards(limit: 1) {
      name
    }
  }
`;

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

const createBoardMutation = gql`
  mutation CreateBoard($boardName: String!) {
    create_board(board_name: $boardName, board_kind: public) {
      id
    }
  }
`;

const createItemMutation = gql`
  mutation CreateItem($boardId: ID!, $itemName: String!, $groupId: String!) {
    create_item(board_id: $boardId, item_name: $itemName, group_id: $groupId) {
      id
    }
  }
`;

function getDealSizeCategory(amount) {
  if (amount < 50000) return 'small';
  if (amount <= 250000) return 'medium';
  return 'large';
}

const tasksBySize = {
  small: ['Onboarding Checklist'],
  medium: ['Assign Project Manager', 'Assign Technical Lead'],
  large: ['Assign Senior PM', 'Assign Architect', 'Notify Finance Team']
};

async function validateToken() {
  try {
    const res = await client.request(validateTokenQuery);
    console.log('✅ Token is valid. Sample board:', res.boards?.[0]?.name || 'N/A');
  } catch (err) {
    console.error('❌ Invalid token or Monday API error:', err.message);
    throw err;
  }
}

async function waitForGroups(boardId, retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await client.request(getGroupsQuery, { boardId });
      const groups = res.boards?.[0]?.groups;
      if (groups?.length > 0) {
        console.log(`✅ Groups retrieved:`, groups);
        return groups[0].id;
      }
      console.log(`No groups found yet. Retrying (${i + 1}/${retries})...`);
    } catch (err) {
      console.error(`Attempt ${i + 1} failed:`, err.message);
    }
    await sleep(delay);
  }
  throw new Error('❌ Failed to retrieve groups after multiple attempts.');
}

async function createBoard(dealName, amount) {
  try {
    await validateToken();

    const boardRes = await client.request(createBoardMutation, { boardName: dealName });
    const boardId = boardRes.create_board.id;
    console.log('✅ Board created:', boardId);

    const groupId = await waitForGroups(boardId);
    const dealSize = getDealSizeCategory(amount);

    for (const taskName of tasksBySize[dealSize]) {
      const itemRes = await client.request(createItemMutation, {
        boardId,
        itemName: taskName,
        groupId
      });
      console.log(`✅ Created item: ${taskName}`);
    }

    return boardId;
  } catch (err) {
    console.error('❌ Monday API Error:', err.message);
    throw new Error('Failed to create board');
  }
}

export { createBoard };
