  interface User { 
     name: string;
  age: number;
}

interface Admin extends User {
  role: string;      // Admin has name, age, AND role
}

const boss: Admin = { name: "GB", age:90, role: "owner" };  // ✅
