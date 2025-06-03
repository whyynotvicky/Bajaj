/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const crypto = require('crypto');
admin.initializeApp();
const db = admin.firestore();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// 1. createOrder: Initiate Fastzix payment
exports.createOrder = functions.https.onRequest(async (req, res) => {
  try {
    const { amount, userId } = req.body;
    if (!amount || !userId) return res.status(400).send('Missing amount or userId');
    // Get user from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return res.status(404).send('User not found');
    const user = userDoc.data();
    // Prepare Fastzix API call
    // TODO: Replace with your Fastzix API endpoint, merchant id, and secret key
    const fastzixUrl = 'https://fastzix.in/api/v1/order';
    const data = {
      customer_mobile: user.phone,
      merch_id: 'MM96ZRCC30UQ1748759109',
      amount: amount,
      order_id: 'ORD' + Date.now() + Math.floor(Math.random() * 1000000),
      currency: 'INR',
      redirect_url: 'https://bajaj-fd278.web.app/wallet/rechargerecord',
      udf1: userId,
    };
    // TODO: Generate xverify as per Fastzix docs
    const secret_key = '3kfXy3ZN9VPj7Yyn4Qb6T0N0cesRnIXo';
    // Generate xverify as per Fastzix docs (same as PHP)
    function generateXverify(data, secret_key) {
      const sortedKeys = Object.keys(data).sort();
      const dataString = sortedKeys.map(key => key + '=' + data[key]).join('|');
      return crypto.createHmac('sha256', secret_key).update(dataString).digest('hex');
    }
    const xverify = generateXverify(data, secret_key);
    const response = await fetch(fastzixUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xverify,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.status && result.result && result.result.payment_url) {
      // Optionally, create a pending order in Firestore
      await db.collection('orders').add({
        userId,
        orderId: data.order_id,
        amount,
        status: 'pending',
        created: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ payment_url: result.result.payment_url });
    } else {
      res.status(500).send('Failed to create Fastzix order');
    }
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});

// 2. fastzixCallback: Handle Fastzix webhook
exports.fastzixCallback = functions.https.onRequest(async (req, res) => {
  try {
    const { status, order_id } = req.body;
    if (!status || !order_id) return res.status(400).send('Missing status or order_id');
    // Find the order in Firestore
    const orders = await db.collection('orders').where('orderId', '==', order_id).get();
    if (orders.empty) return res.status(404).send('Order not found');
    const orderRef = orders.docs[0].ref;
    if (status === 'SUCCESS') {
      await orderRef.update({ status: 'success', completed: admin.firestore.FieldValue.serverTimestamp() });
      // Optionally, update user balance
      const order = orders.docs[0].data();
      const userRef = db.collection('users').doc(order.userId);
      await userRef.update({
        balance: admin.firestore.FieldValue.increment(order.amount),
        total_money: admin.firestore.FieldValue.increment(order.amount),
      });
      res.send('Order updated and user balance incremented');
    } else {
      await orderRef.update({ status });
      res.send('Order status updated');
    }
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});

// Fastzix payment webhook handler
exports.fastzixWebhook = functions.https.onRequest(async (req, res) => {
  const { status, order_id, amount, udf1 } = req.body;
  console.log('Fastzix Webhook:', req.body);
  // TODO: Update Firestore order/payment status here if needed
  res.send('OK');
});
