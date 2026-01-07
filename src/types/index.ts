export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface StartingNumber {
  id: number;
  user_id: number;
  number: number;
  created_at: Date;
}

export interface Operation {
  id: number;
  user_id: number;
  parent_id: number | null;
  parent_operation_id: number | null;
  operation_type: 'add' | 'subtract' | 'multiply' | 'divide';
  right_operand: number;
  result: number;
  created_at: Date;
}

export interface OperationNode {
  id: number;
  type: 'starting' | 'operation';
  user_id: number;
  username?: string;
  value: number;
  operation_type?: 'add' | 'subtract' | 'multiply' | 'divide';
  right_operand?: number;
  created_at: string;
  children: OperationNode[];
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateStartingNumberRequest {
  number: number;
}

export interface CreateOperationRequest {
  parent_id: number;
  parent_type: 'starting' | 'operation';
  operation_type: 'add' | 'subtract' | 'multiply' | 'divide';
  right_operand: number;
}
