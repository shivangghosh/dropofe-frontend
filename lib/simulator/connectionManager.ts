/**
 * Unified Database Connection Manager
 * Switches between real MongoDB and Simulator based on configuration
 */

import { connect, set } from 'mongoose';
import SimulatorDatabase from './simulatorDb';
import envConfig from '@/config';

let isConnected = false;
let simulatorInitialized = false;

// Determine if simulator mode is enabled
const USE_SIMULATOR = process.env.NEXT_PUBLIC_USE_SIMULATOR === 'true' || process.env.USE_SIMULATOR === 'true';

export async function connectToDb() {
  set('strictQuery', true);
  try {
    if (USE_SIMULATOR) {
      // Initialize simulator instead of MongoDB
      const simulator = SimulatorDatabase.getInstance();
      await simulator.initialize();
      simulatorInitialized = true;
      console.log('[CONNECTION] Using Simulator Database (localhost:3000)');
      return;
    }

    if (isConnected) {
      console.log('Using existing database connection');
      return;
    }
    await connect(envConfig.MONGODB_URI, { dbName: 'dev_overflow' });
    console.log('Connected to database');
    isConnected = true;
  } catch (err) {
    console.log('Failed to connect to database', err);
  }
}

export function isUsingSimulator(): boolean {
  return USE_SIMULATOR;
}

export default connectToDb;
