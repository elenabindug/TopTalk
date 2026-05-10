import { useState, useEffect } from 'react';

export async function getChats() {
  console.log("Функция вызвана getChats");
  return {
    data: [
      { id: 1, name: "Общий чат" },
      { id: 2, name: "С Леной" }
    ]
  };
}