// app/api/chat/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received chat request:', body);
    
    // 这里处理你的聊天逻辑
    return NextResponse.json({
      success: true,
      message: 'Chat processed successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}