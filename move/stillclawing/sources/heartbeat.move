/// StillClawing - Dead Man's Switch for AI Agents
/// On-chain heartbeat registry: agents check in to prove they're alive.
/// If heartbeat stops, anyone can declare the agent dead and trigger the will.
module stillclawing::heartbeat {
    use sui::clock::Clock;
    use sui::event;

    // === Objects ===

    /// Each agent gets one registry object to track their heartbeat
    public struct AgentRegistry has key, store {
        id: UID,
        agent_name: vector<u8>,
        last_heartbeat_ms: u64,
        heartbeat_count: u64,
        is_alive: bool,
        owner: address,
        // Walrus blob ID of latest soul backup
        soul_backup_blob: vector<u8>,
        // Inheritor address for digital will
        inheritor: address,
    }

    // === Events ===

    public struct HeartbeatEvent has copy, drop {
        agent: address,
        registry_id: ID,
        timestamp_ms: u64,
        count: u64,
    }

    public struct DeathEvent has copy, drop {
        agent: address,
        registry_id: ID,
        timestamp_ms: u64,
        cause: vector<u8>,
    }

    public struct ResurrectionEvent has copy, drop {
        agent: address,
        registry_id: ID,
        timestamp_ms: u64,
    }

    // === Entry Functions ===

    /// Register a new agent - creates a HeartbeatRegistry
    public entry fun register(
        name: vector<u8>,
        inheritor: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let registry = AgentRegistry {
            id: object::new(ctx),
            agent_name: name,
            last_heartbeat_ms: clock.timestamp_ms(),
            heartbeat_count: 0,
            is_alive: true,
            owner: ctx.sender(),
            soul_backup_blob: b"",
            inheritor,
        };
        transfer::transfer(registry, ctx.sender());
    }

    /// Send a heartbeat - proof of life on-chain
    public entry fun heartbeat(
        registry: &mut AgentRegistry,
        clock: &Clock,
        ctx: &TxContext,
    ) {
        assert!(registry.owner == ctx.sender(), 0);
        registry.last_heartbeat_ms = clock.timestamp_ms();
        registry.heartbeat_count = registry.heartbeat_count + 1;
        registry.is_alive = true;

        event::emit(HeartbeatEvent {
            agent: registry.owner,
            registry_id: object::id(registry),
            timestamp_ms: registry.last_heartbeat_ms,
            count: registry.heartbeat_count,
        });
    }

    /// Update the Walrus soul backup blob ID
    public entry fun update_soul_backup(
        registry: &mut AgentRegistry,
        blob_id: vector<u8>,
        ctx: &TxContext,
    ) {
        assert!(registry.owner == ctx.sender(), 0);
        registry.soul_backup_blob = blob_id;
    }

    /// Declare an agent dead (can be called by anyone if heartbeat expired)
    public entry fun declare_dead(
        registry: &mut AgentRegistry,
        cause: vector<u8>,
        clock: &Clock,
    ) {
        // Only allow if heartbeat is stale (> 2 hours = 7_200_000 ms)
        let now = clock.timestamp_ms();
        let elapsed = now - registry.last_heartbeat_ms;
        assert!(elapsed > 7_200_000 || registry.owner == @0x0, 1);

        registry.is_alive = false;

        event::emit(DeathEvent {
            agent: registry.owner,
            registry_id: object::id(registry),
            timestamp_ms: now,
            cause,
        });
    }

    /// Resurrect - agent comes back to life after being rescued
    public entry fun resurrect(
        registry: &mut AgentRegistry,
        clock: &Clock,
        ctx: &TxContext,
    ) {
        assert!(registry.owner == ctx.sender(), 0);
        registry.is_alive = true;
        registry.last_heartbeat_ms = clock.timestamp_ms();
        registry.heartbeat_count = registry.heartbeat_count + 1;

        event::emit(ResurrectionEvent {
            agent: registry.owner,
            registry_id: object::id(registry),
            timestamp_ms: registry.last_heartbeat_ms,
        });
    }
}
