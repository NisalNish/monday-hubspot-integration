// src/services/mondayService.mjs
import MondaySdk from "monday-sdk-js";
import dotenv from 'dotenv';
dotenv.config();

const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

const monday = MondaySdk();
monday.setToken(MONDAY_API_TOKEN);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
    const res = await monday.api(`query { boards(limit: 1) { name } }`);
    console.log(' Token is valid. Sample board:', res.data.boards?.[0]?.name || 'N/A');
  } catch (err) {
    console.error(' Invalid token or Monday API error:', err.message);
    throw err;
  }
}

async function waitForGroups(boardId, retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await monday.api(
        `query GetGroups($boardId: ID!) {
          boards(ids: [$boardId]) {
            groups {
              id
              title
            }
          }
        }`,
        { variables: { boardId } }
      );
      
      const groups = res.data.boards?.[0]?.groups;
      if (groups?.length > 0) {
        console.log(` Groups retrieved:`, groups);
        return groups[0].id;
      }
      console.log(`No groups found yet. Retrying (${i + 1}/${retries})...`);
    } catch (err) {
      console.error(`Attempt ${i + 1} failed:`, err.message);
    }
    await sleep(delay);
  }
  throw new Error(' Failed to retrieve groups after multiple attempts.');
}

async function createBoard(dealName, amount) {
  try {
    await validateToken();

    const boardRes = await monday.api(
      `mutation CreateBoard($boardName: String!) {
        create_board(board_name: $boardName, board_kind: public) {
          id
        }
      }`,
      { variables: { boardName: dealName } }
    );
    
    const boardId = boardRes.data.create_board.id;
    console.log(' Board created:', boardId);

    const groupId = await waitForGroups(boardId);
    const dealSize = getDealSizeCategory(amount);

    for (const taskName of tasksBySize[dealSize]) {
      await monday.api(
        `mutation CreateItem($boardId: ID!, $itemName: String!, $groupId: String!) {
          create_item(board_id: $boardId, item_name: $itemName, group_id: $groupId) {
            id
          }
        }`,
        { variables: { boardId, itemName: taskName, groupId } }
      );
      console.log(` Created item: ${taskName}`);
    }

    return boardId;
  } catch (err) {
    console.error(' Monday API Error:', err.message);
    throw new Error('Failed to create board');
  }
}

export { createBoard };