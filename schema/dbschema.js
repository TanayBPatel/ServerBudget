import mongoose from 'mongoose';
const { Schema } = mongoose;

// Subschema for individual transactions
const TransactionSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  type: {
    type: String,
    enum: ['EXPENSE', 'INCOME','TRANSFER'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  account: {
    type: String,
    required: true
  },
  notes: String,
  icon: String,
  userId: String
}, {
  _id: false 
});

// Subschema for daily transactions
const DailyTransactionSchema = new Schema({
  date: {
    type: String, 
    required: true,
  },
  transactions: [TransactionSchema]
});

const BudgetSchema = new Schema({
  category:{
    type: String,
  },
  budget:{
    type: Number,
    default: 0,
    required: true
  },
  CurrentAmount:{
    type: Number,
    default: 0,
    required: true
  },
  Icon : {
    type: String,
    default: "📦"
  }
})

const UserBudgetSchema = new Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  email: String,
  currency: String,
  language: String,
  age: Number,
  gender: String,
  notificationSetting: {
    type: Boolean,
    default: false
  },
  dailyTransactions: [DailyTransactionSchema],
  budget : [BudgetSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Optional: Update `updatedAt` on save
UserBudgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserBudget = mongoose.model('Mr.Fintech', UserBudgetSchema);

export default UserBudget;
