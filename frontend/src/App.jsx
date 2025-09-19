import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import ExpenseList from './components/ExpenseList.jsx';
import ExpenseForm from './components/ExpenseForm.jsx';
import Chatbot from './components/ChatBot.jsx';
import ExpenseChart from './components/ExpenseChart.jsx';
import ExpenseSummary from './components/ExpenseSummary.jsx'; // Import the new summary component
import './App.css';

const API_URL = 'http://localhost:5001/api/expenses';

function App() {
  // --- STATE MANAGEMENT ---
  const [expenses, setExpenses] = useState([]);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [chatbotMessages, setChatbotMessages] = useState([{ from: 'bot', text: 'Welcome! Add an expense on the left, and I will give you a personalized savings tip here.' }]);

  // --- DATA FETCHING ---
  useEffect(() => {
    getExpenses();
  }, []);

  const getExpenses = async () => {
    try {
      const res = await axios.get(API_URL);
      setExpenses(res.data.data);
    } catch (error) {
      console.error("Error fetching expenses", error);
    }
  };

  // --- CHATBOT LOGIC ---
  const triggerChatbot = async (expense) => {
    const userMessage = { from: 'user', text: `Logged: ₹${expense.amount} for ${expense.description}` };
    setChatbotMessages(prev => [...prev, userMessage]);
    try {
      const res = await axios.post('http://localhost:5001/api/chatbot', expense);
      const botMessage = { from: 'bot', text: res.data.reply };
      setChatbotMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching bot reply", error);
    }
  };

  // --- CRUD OPERATIONS ---
  const addExpense = async (expense) => {
    try {
      const res = await axios.post(API_URL, expense);
      const newExpense = res.data.data;
      setExpenses(prevExpenses => [...prevExpenses, newExpense]);
      triggerChatbot(newExpense);
    } catch (error) {
      console.error("Error adding expense", error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setExpenses(expenses.filter(expense => expense._id !== id));
    } catch (error) {
      console.error("Error deleting expense", error);
    }
  };

  const updateExpense = async (id, updatedExpense) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, updatedExpense);
      setExpenses(expenses.map(exp => (exp._id === id ? res.data.data : exp)));
      setExpenseToEdit(null);
    } catch (error) {
      console.error("Error updating expense", error);
    }
  };

  // --- CALCULATIONS ---
  const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);

  // --- RENDER ---
  return (
    <div className="app-container">
      {/* --- Left Column: Main Content --- */}
      <main className="main-content">
        <h1 className="mb-4" style={{ color: 'var(--headline-color)', fontWeight: '600' }}>Expense Dashboard</h1>
        
        {/* The new total expenses summary card */}
        <ExpenseSummary total={totalExpenses} />

        <ExpenseForm 
          addExpense={addExpense} 
          expenseToEdit={expenseToEdit} 
          setExpenseToEdit={setExpenseToEdit}
          updateExpense={updateExpense} 
        />

        <Row className="g-4">
            <Col md={7}>
                 <ExpenseList 
                    expenses={expenses} 
                    deleteExpense={deleteExpense} 
                    setExpenseToEdit={setExpenseToEdit}
                 />
            </Col>
            <Col md={5}>
                <ExpenseChart expenses={expenses} />
            </Col>
        </Row>
      </main>

      {/* --- Right Column: Chatbot Sidebar --- */}
      <aside className="sidebar">
        <Chatbot messages={chatbotMessages} />
      </aside>
    </div>
  );
}

export default App;