import express from 'express';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import cors from 'cors';

// Custom imports
import dbconnection from './model/dbconnection.js';
import  UserBudget  from './schema/dbschema.js'; // Import UserBudget model

dotenv.config();

const app = express();
const port = process.env.PORT ;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

dbconnection();

// // POST - Add new transaction  

//clerkUserId + Date + Transaction{type ,amount , category, account}

// {
//   "clerkUserId": "10",
//   "date": "2025-04-06",
//   "transaction": {
//     "type": "EXPENSE",
//     "amount": 10,
//     "category": "Food",
//     "account": "Credit Card"
//   }
// }
 app.post(
  '/transactions',
  asyncHandler(async (req, res) => {
    const { clerkUserId, date, transaction } = req.body;

    // Validate required fields
    if (!clerkUserId || !date || !transaction || 
        !transaction.type || !transaction.amount || 
        !transaction.category || !transaction.account) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the user
    const user = await UserBudget.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if this date already exists in dailyTransactions
    let dailyEntry = user.dailyTransactions.find(dt => dt.date === date);

    if (!dailyEntry) {
      // If no entry for this date, add a new one
      user.dailyTransactions.push({
        date,
        transactions: [transaction]
      });
    } else {
      // If date exists, just push the new transaction
      dailyEntry.transactions.push(transaction);
    }

    // Save updated user (with new transaction)
    await user.save();

    res.status(201).json({ message: 'Transaction added successfully', user });
  })
);

// // GET - Fetch transactions for a specific date
// {
//   "clerkUserId": "10",
//   "date": "2025-04-06"
// }
app.post('/transactions/getforUserUsingDate', asyncHandler(async (req, res) => {
  const { clerkUserId, date } = req.body;


  if (!clerkUserId ) {
    return res.status(400).json({ error: 'clerkUserId and date are required' });
  }
  else if (!date) {
    return res.status(400).json({ error: 'date is required' });
  }

  const userBudget = await UserBudget.findOne({
    clerkUserId: clerkUserId,
    'dailyTransactions.date': date
  });

  if (!userBudget) {
    return res.status(404).json({ error: 'User or date not found' });
  }

  const dailyTx = userBudget.dailyTransactions.find(dt => dt.date === date);

  res.json({ transactions: dailyTx?.transactions || [] });
}));

// // GET - Fetch all transactions for analytics
// {
//   "clerkUserId": "10"
// }
app.get('/transactionsAll', asyncHandler(async (req, res) => {
  const { clerkUserId } = req.body;

  if (!clerkUserId) {
    return res.status(400).json({ error: 'clerkUserId is required' });
  }

  const userBudget = await UserBudget.findOne({ clerkUserId });

  if (!userBudget) {
    return res.status(404).json({ error: 'User not found' });
  }

  let allTransactions = [];

  userBudget.dailyTransactions.forEach(day => {
    day.transactions.forEach(tx => {
      allTransactions.push({
        ...tx.toObject(),
        date: day.date
      });
    });
  });

  // Optional: Sort by date descending
  allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ transactions: allTransactions });
}));

//PUT - Update a transaction is remaining 

// // DELETE - Delete a transaction
app.delete('/transactions/delete', asyncHandler(async (req, res) => {
  const { clerkUserId,transactionId } = req.body;

  const userBudget = await UserBudget.findOne({ clerkUserId });
  
  if (!userBudget) {
    return res.status(404).json({ error: 'User budget not found' });
  }

  // Find and remove the transaction
  let found = false;
  for (let dailyTx of userBudget.dailyTransactions) {
    const transactionIndex = dailyTx.transactions.findIndex(
      t => t._id.toString() === transactionId
    );
    
    if (transactionIndex !== -1) {
      dailyTx.transactions.splice(transactionIndex, 1);
      found = true;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  await userBudget.save();
  res.json({ message: 'Transaction deleted successfully' });
}));// Import the UserBudget model (ensure correct path)





















// GET / (List all user budgets)
app.get(
  '/',
  asyncHandler(async (req, res) => {
    const allUsers = await UserBudget.find();
    res.status(200).json(allUsers);
  })
);

// GET /users/:id
//only need clerkUserId IN URL
app.post(
  '/',
  asyncHandler(async (req, res) => {
    const { clerkUserId } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await UserBudget.findOne({ clerkUserId: clerkUserId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  })
);

// POST /users
//only need clerkUserId
app.post(
  '/users',
  asyncHandler(async (req, res) => {
    const { clerkUserId } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ error: 'clerkUserId is required' });
    }

    const existingUser = await UserBudget.findOne({ clerkUserId });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new UserBudget({ clerkUserId });
    await newUser.save();

    res.status(201).json(newUser);
  })
);

// PUT /users/:clerkUserId       
// clerkUserId + 
// updated field of any of these email
  // currency: 
  // language: 
  // age:
  // gender: 
  // notificationSetting:
  // dailyTransactions: [DailyTransactionSchema],
  // budget : [BudgetSchema],
  // createdAt:
  // updatedAt: 

app.put(
  '/users/:clerkUserId',
  asyncHandler(async (req, res) => {
    const { clerkUserId } = req.params;
    const updateData = req.body;

    // Prevent updating clerkUserId via request body
    const { clerkUserId: _, ...allowedUpdates } = updateData;

    const updatedUser = await UserBudget.findOneAndUpdate(
      { clerkUserId },
      { ...allowedUpdates, updatedAt: Date.now() },
      { new: true, runValidators: true, upsert: false } //kindof required for making an update in db 
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  })
);
// Server


























// { clerkUserId, category, budget, CurrentAmount }
//BUDGET 

app.post('/budget', asyncHandler(async (req, res) => {
  const { clerkUserId, category, budget, CurrentAmount } = req.body;

  // Validate required fields
  if (!clerkUserId || !category || budget === undefined) {
    return res.status(400).json({ error: 'clerkUserId, category, and budget are required' });
  }

  // Find the user
  const user = await UserBudget.findOne({ clerkUserId });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if category already exists
  const existingBudget = user.budget.find(b => b.category === category);
  if (existingBudget) {
    return res.status(400).json({ error: 'Budget for this category already exists' });
  }

  // Add new budget
  user.budget.push({
    category,
    budget,
    CurrentAmount
  });

  await user.save();

  res.status(201).json({ message: 'Budget added successfully', budget: user.budget });
}));



// { "clerkUserId":"10", "category":"nah", "budget":100,"CurrentAmount" : 10} and Budget Id in Params
app.put('/budgetupdate', asyncHandler(async (req, res) => {
  const { clerkUserId, category, budget, CurrentAmount } = req.body;

  // Validate required fields
  if (!clerkUserId || !category || budget === undefined) {
    return res.status(400).json({
      error: 'clerkUserId, category, and budget are required'
    });
  }

  // Find the user
  const user = await UserBudget.findOne({ clerkUserId });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Find the budget item by category
  const budgetItem = user.budget.find(b => b.category === category);

  if (!budgetItem) {
    return res.status(404).json({ error: 'Budget for this category not found' });
  }

  // Update values
  budgetItem.budget = budget;
  budgetItem.CurrentAmount = CurrentAmount ?? budgetItem.CurrentAmount;

  await user.save();

  res.json({
    message: 'Budget updated successfully',
    budget: budgetItem
  });
}));



//{ "clerkUserId":"10",  } and budget id in req param URL

app.post('/budgetdelete', asyncHandler(async (req, res) => {
  const { clerkUserId, category } = req.body;

  // Validate required fields
  if (!clerkUserId || !category) {
    return res.status(400).json({ error: 'clerkUserId and category are required' });
  }

  // Find the user
  const user = await UserBudget.findOne({ clerkUserId });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Find index of the budget item by category
  const budgetIndex = user.budget.findIndex(b => b.category === category);

  if (budgetIndex === -1) {
    return res.status(404).json({ error: 'Budget with this category not found' });
  }

  // Remove the budget item
  user.budget.splice(budgetIndex, 1);

  // Save the updated user document
  await user.save();

  res.json({ message: 'Budget deleted successfully' });
}));

// GET /budget?clerkUserId=user_123
app.post('/budgetGet', asyncHandler(async (req, res) => {
  const { clerkUserId } = req.body;

  if (!clerkUserId) {
    return res.status(400).json({ error: 'clerkUserId is required' });
  }

  const user = await UserBudget.findOne({ clerkUserId });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ budget: user.budget });
}));


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});