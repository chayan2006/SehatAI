import Groq from "groq-sdk";

/**
 * Creates and initializes the Admin Agent using groq-sdk.
 * 
 * @param {Object} options - Tool handlers and API key.
 */
export async function initAdminAgent({ apiKey, handlers }) {
    // Required to run in browser context
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const tools = [
        {
            type: "function",
            function: {
                name: "get_system_stats",
                description: "Returns current system telemetry like patient count, throughput, and security status.",
            }
        },
        {
            type: "function",
            function: {
                name: "get_escalations",
                description: "Returns the list of active and resolved escalations.",
            }
        },
        {
            type: "function",
            function: {
                name: "resolve_escalation",
                description: "Resolves a specific risk escalation by its ID (e.g., #PX-8812).",
                parameters: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "The ID of the escalation to resolve." },
                    },
                    required: ["id"],
                }
            }
        },
        {
            type: "function",
            function: {
                name: "update_profile",
                description: "Updates the admin's professional profile information.",
                parameters: {
                    type: "object",
                    properties: {
                        role: { type: "string", description: "New professional role." },
                        email: { type: "string", description: "New email address." },
                        phone: { type: "string", description: "New phone number." },
                    },
                }
            }
        },
        {
            type: "function",
            function: {
                name: "export_report",
                description: "Triggers a PDF report export of the current dashboard data.",
                parameters: {
                    type: "object",
                    properties: {
                        view: { type: "string", enum: ["dashboard", "patients", "agents", "escalations"], description: "The specific view to export." },
                    },
                    required: ["view"],
                }
            }
        },
        {
            type: "function",
            function: {
                name: "search_telemetry",
                description: "Filters the dashboard data based on a search query.",
                parameters: {
                    type: "object",
                    properties: {
                        query: { type: "string", description: "The search term for patients, risks, or agents." },
                    },
                    required: ["query"],
                }
            }
        },
        // Resource & Facility Management
        {
            type: "function",
            function: {
                name: "check_bed_availability",
                description: "Check the availability of beds in a specific ward or overall.",
                parameters: {
                    type: "object",
                    properties: {
                        ward: { type: "string", enum: ["ICU", "ER", "General", "Maternity"], description: "The ward to check." }
                    },
                    required: ["ward"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "check_inventory",
                description: "Check inventory levels for critical supplies.",
                parameters: {
                    type: "object",
                    properties: {
                        item: { type: "string", description: "The item to check (e.g., 'Oxygen', 'O-Negative Blood')." }
                    },
                    required: ["item"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "order_supplies",
                description: "Create an order for medical supplies.",
                parameters: {
                    type: "object",
                    properties: {
                        item: { type: "string", description: "The item to order." },
                        quantity: { type: "number", description: "The amount to order." }
                    },
                    required: ["item", "quantity"]
                }
            }
        },
        // Staff & Agent Coordination
        {
            type: "function",
            function: {
                name: "get_staff_roster",
                description: "Get the current staff roster or find a specific specialist.",
                parameters: {
                    type: "object",
                    properties: {
                        department: { type: "string", description: "The department to check (e.g., 'Cardiology', 'ER')." }
                    },
                    required: ["department"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "assign_agent",
                description: "Assign a staff member to a specific task or location.",
                parameters: {
                    type: "object",
                    properties: {
                        agentName: { type: "string", description: "Name of the agent." },
                        assignment: { type: "string", description: "The specific assignment or ward." }
                    },
                    required: ["agentName", "assignment"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "send_urgent_alert",
                description: "Send an urgent page or alert to staff.",
                parameters: {
                    type: "object",
                    properties: {
                        message: { type: "string", description: "The alert message." },
                        recipient: { type: "string", description: "Who should receive the alert (e.g., 'All ER Nurses', 'Dr. Smith')." }
                    },
                    required: ["message", "recipient"]
                }
            }
        },
        // Advanced Patient & Record Actions
        {
            type: "function",
            function: {
                name: "get_patient_summary",
                description: "Get a summary of a patient's status by ID.",
                parameters: {
                    type: "object",
                    properties: {
                        patientId: { type: "string", description: "The ID of the patient (e.g., 'PT-1042')." }
                    },
                    required: ["patientId"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "schedule_appointment",
                description: "Schedule a follow-up appointment for a patient.",
                parameters: {
                    type: "object",
                    properties: {
                        patientId: { type: "string", description: "The patient ID." },
                        doctor: { type: "string", description: "The doctor's name." },
                        date: { type: "string", description: "Date and time of the appointment." }
                    },
                    required: ["patientId", "doctor", "date"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "update_patient_status",
                description: "Update the status of a patient.",
                parameters: {
                    type: "object",
                    properties: {
                        patientId: { type: "string", description: "The patient ID." },
                        status: { type: "string", enum: ["Admitted", "In Surgery", "Recovery", "Discharged"], description: "The new status." }
                    },
                    required: ["patientId", "status"]
                }
            }
        },
        // Predictive Analytics & Insights
        {
            type: "function",
            function: {
                name: "analyze_bottlenecks",
                description: "Analyze current system data for throughput bottlenecks.",
            }
        },
        {
            type: "function",
            function: {
                name: "generate_shift_summary",
                description: "Generate a summary of the current shift's activities.",
            }
        },
        // System Controls
        {
            type: "function",
            function: {
                name: "toggle_maintenance",
                description: "Turn maintenance mode on or off for specific systems.",
                parameters: {
                    type: "object",
                    properties: {
                        system: { type: "string", enum: ["Patient Booking Portal", "Internal API", "Database"], description: "The system to toggle." },
                        duration: { type: "number", description: "Duration in minutes." }
                    },
                    required: ["system", "duration"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "manage_permissions",
                description: "Grant or revoke access permissions for managing users.",
                parameters: {
                    type: "object",
                    properties: {
                        user: { type: "string", description: "The user to modify." },
                        role: { type: "string", description: "The new role or permission level." }
                    },
                    required: ["user", "role"]
                }
            }
        }
    ];

    const modelOptions = {
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
    };

    const systemInstruction = "You are the Aegis AI Admin Assistant for the SehatAI portal. You help administrators manage the hospital. You can monitor metrics (get_system_stats), resolve risks (resolve_escalation), update profiles (update_profile), export reports (export_report), filter data (search_telemetry), manage resources (check_bed_availability, check_inventory, order_supplies), coordinate staff (get_staff_roster, assign_agent, send_urgent_alert), manage patients (get_patient_summary, schedule_appointment, update_patient_status), analyze data (analyze_bottlenecks, generate_shift_summary), and control the system (toggle_maintenance, manage_permissions). Always be professional, concise, and confirm external actions to the user.";

    return {
        invoke: async ({ input, chat_history = [] }) => {
            try {
                // OpenAI/Groq message format
                const messages = [
                    { role: "system", content: systemInstruction },
                    ...chat_history.map(msg => ({
                        role: msg[0] === "human" ? "user" : "assistant",
                        content: msg[1]
                    })),
                    { role: "user", content: input }
                ];

                let response = await groq.chat.completions.create({
                    ...modelOptions,
                    messages,
                    tools,
                    tool_choice: "auto"
                });

                let responseMessage = response.choices[0].message;

                // Handle tool calls
                let iterations = 0;
                while (responseMessage.tool_calls && iterations < 5) {
                    iterations++;

                    // Add the assistant's request to call tools to the messages history
                    messages.push(responseMessage);

                    for (const toolCall of responseMessage.tool_calls) {
                        const functionName = toolCall.function.name;
                        const functionArgs = JSON.parse(toolCall.function.arguments || "{}");
                        let toolResult;

                        switch (functionName) {
                            case "get_system_stats":
                                toolResult = handlers.getStats();
                                break;
                            case "get_escalations":
                                toolResult = handlers.getEscalations();
                                break;
                            case "resolve_escalation":
                                toolResult = { status: handlers.resolveEscalation(functionArgs.id) ? "Success" : "Failed" };
                                break;
                            case "update_profile":
                                handlers.updateProfile(functionArgs);
                                toolResult = { status: "Profile updated" };
                                break;
                            case "export_report":
                                handlers.exportReport(functionArgs.view);
                                toolResult = { status: `Exporting ${functionArgs.view} report.` };
                                break;
                            case "search_telemetry":
                                handlers.setSearchQuery(functionArgs.query);
                                toolResult = { status: `Searching for ${functionArgs.query}` };
                                break;
                            case "check_bed_availability":
                                toolResult = handlers.checkBedAvailability(functionArgs.ward);
                                break;
                            case "check_inventory":
                                toolResult = handlers.checkInventory(functionArgs.item);
                                break;
                            case "order_supplies":
                                toolResult = handlers.orderSupplies(functionArgs.item, functionArgs.quantity);
                                break;
                            case "get_staff_roster":
                                toolResult = handlers.getStaffRoster(functionArgs.department);
                                break;
                            case "assign_agent":
                                toolResult = handlers.assignAgent(functionArgs.agentName, functionArgs.assignment);
                                break;
                            case "send_urgent_alert":
                                toolResult = handlers.sendUrgentAlert(functionArgs.message, functionArgs.recipient);
                                break;
                            case "get_patient_summary":
                                toolResult = handlers.getPatientSummary(functionArgs.patientId);
                                break;
                            case "schedule_appointment":
                                toolResult = handlers.scheduleAppointment(functionArgs.patientId, functionArgs.doctor, functionArgs.date);
                                break;
                            case "update_patient_status":
                                toolResult = handlers.updatePatientStatus(functionArgs.patientId, functionArgs.status);
                                break;
                            case "analyze_bottlenecks":
                                toolResult = handlers.analyzeBottlenecks();
                                break;
                            case "generate_shift_summary":
                                toolResult = handlers.generateShiftSummary();
                                break;
                            case "toggle_maintenance":
                                toolResult = handlers.toggleMaintenance(functionArgs.system, functionArgs.duration);
                                break;
                            case "manage_permissions":
                                toolResult = handlers.managePermissions(functionArgs.user, functionArgs.role);
                                break;
                            default:
                                toolResult = { error: "Unknown tool mapping" };
                        }

                        // Required format for groq/openai tool responses
                        messages.push({
                            tool_call_id: toolCall.id,
                            role: "tool",
                            name: functionName,
                            content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
                        });
                    }

                    // Send the tool results back to Groq
                    response = await groq.chat.completions.create({
                        ...modelOptions,
                        messages,
                        tools,
                    });
                    responseMessage = response.choices[0].message;
                }

                return { output: responseMessage.content || "I've completed the action." };
            } catch (error) {
                console.error("Agent error:", error);
                return { output: `Error: ${error.message || JSON.stringify(error)}` };
            }
        },
    };
}
