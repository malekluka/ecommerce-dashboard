const mongoose = require('mongoose');

const customers = [
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae002231838a'),
    customerId: "C-1001",
    username: "john_doe",
    email: "john.doe@gmail.com",
    password: "hashed_password_1",
    firstName: "John",
    lastName: "Doe",
    address: "123 Main St, Springfield",
    phone: "+1-555-1234"
  },
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae002231838b'),
    customerId: "C-1002",
    username: "jane_smith",
    email: "jane.smith@gmail.com",
    password: "hashed_password_2",
    firstName: "Jane",
    lastName: "Smith",
    address: "456 Oak Ave, Metropolis",
    phone: "+1-555-5678"
  },
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae002231838c'),
    customerId: "C-1003",
    username: "alice_wonder",
    email: "alice.wonder@gmail.com",
    password: "hashed_password_3",
    firstName: "Alice",
    lastName: "Wonder",
    address: "789 Elm St, Gotham",
    phone: "+1-555-9012"
  },
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae002231838d'),
    customerId: "C-1004",
    username: "bob_builder",
    email: "bob.builder@gmail.com",
    password: "hashed_password_4",
    firstName: "Bob",
    lastName: "Builder",
    address: "321 Maple Rd, Star City",
    phone: "+1-555-3456"
  }
];

module.exports = customers;