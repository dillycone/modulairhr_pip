import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get the absolute path to the documentation file
    const filePath = path.join(process.cwd(), 'documentation', 'google_auth.md');
    console.log('Loading documentation from:', filePath);
    
    // Check if the file exists
    try {
      await fs.access(filePath);
    } catch (accessError) {
      console.error('File not found:', filePath, accessError);
      return NextResponse.json(
        {
          error: 'Documentation file not found',
          path: filePath,
          success: false
        },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Validate content (ensure it's not empty)
    if (!fileContent || fileContent.trim().length === 0) {
      console.error('Empty documentation file:', filePath);
      return NextResponse.json(
        {
          error: 'Documentation file is empty',
          path: filePath,
          success: false
        },
        { status: 500 }
      );
    }
    
    console.log('Successfully loaded documentation, size:', fileContent.length);
    
    // Return the content as JSON
    return NextResponse.json({
      content: fileContent,
      success: true,
      contentLength: fileContent.length,
      containsMermaid: fileContent.includes('```mermaid')
    });
  } catch (error) {
    console.error('Error reading documentation file:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to load documentation',
        message: error instanceof Error ? error.message : String(error),
        success: false
      },
      { status: 500 }
    );
  }
} 