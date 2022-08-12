import { AuthClient } from "@/client/auth-client";
import { HouseholdClient } from "@/client/household-client";
import { SseClient } from "@/client/sse-client";
import { TaskClient } from "@/client/task-client";
import { UserClient } from "@/client/user-client";
import { PushService } from "@/push";
import { Store, State, ComputedGetters } from "@/store";
import { InjectionKey } from "vue";

export const storeSymbol = Symbol() as InjectionKey<Store>;
export const stateSymbol = Symbol() as InjectionKey<State>;
export const gettersSymbol = Symbol() as InjectionKey<ComputedGetters>;
export const householdClientSymbol = Symbol() as InjectionKey<HouseholdClient>;
export const authClientSymbol = Symbol() as InjectionKey<AuthClient>;
export const sseClientSymbol = Symbol() as InjectionKey<SseClient>;
export const taskClientSymbol = Symbol() as InjectionKey<TaskClient>;
export const userClientSymbol = Symbol() as InjectionKey<UserClient>;
export const pushSymbol = Symbol() as InjectionKey<PushService>;