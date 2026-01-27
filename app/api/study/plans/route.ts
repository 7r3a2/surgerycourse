import { NextResponse } from 'next/server';

// Helper to run subprocess scripts
async function runScript(scriptName: string, args: any): Promise<any> {
    const { spawn } = require('child_process');
    const path = require('path');

    return new Promise((resolve, reject) => {
        const scriptPath = path.join(process.cwd(), 'scripts', scriptName);
        const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

        // Quote path to handle spaces in directory names on Windows
        const safeScriptPath = `"${scriptPath}"`;

        const child = spawn(npxCmd, ['tsx', safeScriptPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd(),
            env: { ...process.env, PATH: process.env.PATH },
            shell: true
        });

        let stdout = '';
        let stderr = '';

        child.stdin.write(JSON.stringify(args));
        child.stdin.end();

        child.stdout.on('data', (data: any) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data: any) => {
            stderr += data.toString();
        });

        child.on('close', (code: number) => {
            if (code !== 0) {
                console.error(`Subprocess ${scriptName} failed:`, stderr);
                try {
                    const fs = require('fs');
                    fs.writeFileSync('subprocess_error.txt', `Script: ${scriptName}\nExit Code: ${code}\nStderr: ${stderr}\nStdout: ${stdout}\n`);
                } catch (fsErr) {
                    console.error('Failed to write error log:', fsErr);
                }
                reject(new Error(stderr || 'Subprocess failed'));
            } else {
                try {
                    const result = JSON.parse(stdout);
                    if (result.success) {
                        resolve(result.data);
                    } else {
                        reject(new Error(result.error || 'Unknown script error'));
                    }
                } catch (e) {
                    console.error('Failed to parse subprocess output:', stdout);
                    reject(new Error('Invalid output from subprocess'));
                }
            }
        });

        child.on('error', (err: any) => {
            console.error('Failed to start subprocess:', err);
            reject(err);
        });
    });
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
        }

        const plans = await runScript('get_study_plans.ts', { userId });
        return NextResponse.json(plans);
    } catch (error) {
        console.error('Error fetching study plans:', error);
        return NextResponse.json({ error: 'Failed to fetch study plans', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const plan = await runScript('create_study_plan.ts', body);
        return NextResponse.json(plan);

    } catch (error) {
        console.error('Error creating study plan:', error);
        return NextResponse.json({ error: 'Failed to create study plan', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
