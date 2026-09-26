import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  getSystemHealth,
  getIssueMetrics,
  getStaleIssues,
  getStaffWorkload,
  inspectAuditLogs,
  getPendingClaims,
} from '../server/mcp/tools';

async function main() {
  const server = new Server(
    {
      name: 'campusconnect-ops',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register ListTools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_system_health',
          description:
            'Returns system connectivity health, database status, uptime, and environment.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_issue_metrics',
          description:
            'Returns issue statistics grouped by canonical backend statuses (Reported, Under_Review, Assigned, In_Progress, Resolved, Verified), priorities, and categories.',
          inputSchema: {
            type: 'object',
            properties: {
              department: {
                type: 'string',
                description: 'Optional department filter (e.g., Facilities Management)',
              },
            },
          },
        },
        {
          name: 'get_stale_issues',
          description:
            'Returns issues in Reported status that have been unaddressed for >72 hours.',
          inputSchema: {
            type: 'object',
            properties: {
              thresholdHours: {
                type: 'number',
                description: 'Threshold hours in Reported status (default: 72)',
              },
            },
          },
        },
        {
          name: 'get_staff_workload',
          description:
            'Returns read-only staff workload metrics (assigned and in-progress issue counts per staff member).',
          inputSchema: {
            type: 'object',
            properties: {
              department: {
                type: 'string',
                description: 'Optional department filter',
              },
            },
          },
        },
        {
          name: 'inspect_audit_logs',
          description:
            'Queries recent audit logs for system diagnostics and activity monitoring.',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of logs to return (default: 20, max: 100)',
              },
              actionType: {
                type: 'string',
                description: 'Optional filter by action type (e.g., ISSUE_STATUS_UPDATE)',
              },
              entityType: {
                type: 'string',
                description: 'Optional filter by entity type (e.g., Issue, User, Comment)',
              },
            },
          },
        },
        {
          name: 'get_pending_claims',
          description:
            'Returns Lost & Found claims currently in Pending status requiring review.',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of pending claims to return (default: 20)',
              },
            },
          },
        },
      ],
    };
  });

  // Register CallTool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result: unknown;

      switch (name) {
        case 'get_system_health':
          result = await getSystemHealth();
          break;
        case 'get_issue_metrics':
          result = await getIssueMetrics((args as { department?: string }) || {});
          break;
        case 'get_stale_issues':
          result = await getStaleIssues(
            (args as { thresholdHours?: number }) || {}
          );
          break;
        case 'get_staff_workload':
          result = await getStaffWorkload(
            (args as { department?: string }) || {}
          );
          break;
        case 'inspect_audit_logs':
          result = await inspectAuditLogs(
            (args as { limit?: number; actionType?: string; entityType?: string }) ||
              {}
          );
          break;
        case 'get_pending_claims':
          result = await getPendingClaims((args as { limit?: number }) || {});
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      const errMessage =
        error instanceof Error ? error.message : 'Tool execution error';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: errMessage }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Fatal MCP Server Error:', err);
  process.exit(1);
});
