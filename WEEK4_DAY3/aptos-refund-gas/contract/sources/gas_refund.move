module message_board_addr::message_board {
    use std::string::String;
    use std::vector;
    use aptos_framework::object::{Self, ExtendRef};
    use aptos_framework::account;
    use aptos_std::debug;

    struct Message has key {
        string_content: String,
    }

    const BOARD_OBJECT_SEED: vector<u8> = b"message_board";

    struct BoardObjectController has key {
        extend_ref: ExtendRef,
    }

    // Error codes
    const E_INTENTIONAL_FAILURE: u64 = 1000;

    // This function is only called once when the module is published for the first time.
    // init_module is optional, you can also have an entry function as the initializer.
    fun init_module(sender: &signer) {
        let constructor_ref = &object::create_named_object(sender, BOARD_OBJECT_SEED);
        move_to(&object::generate_signer(constructor_ref), BoardObjectController {
            extend_ref: object::generate_extend_ref(constructor_ref),
        });
    }

    // ======================== Write functions ========================

    // Simple transaction - posts a message with minimal gas usage
    public entry fun post_message_simple(
        _sender: &signer,
        new_string_content: String,
    ) acquires Message, BoardObjectController {
        if (!exist_message()) {
            let board_obj_signer = get_board_obj_signer();
            move_to(&board_obj_signer, Message {
                string_content: new_string_content,
            });
        };
        let message = borrow_global_mut<Message>(get_board_obj_address());
        message.string_content = new_string_content;
    }

    // Complex transaction - performs multiple operations to use more gas
    public entry fun post_message_complex(
        _sender: &signer,
        new_string_content: String,
    ) acquires Message, BoardObjectController {
        // Create a vector and perform operations to consume more gas
        let i = 0;
        let v = vector::empty<u64>();
        while (i < 100) {
            vector::push_back(&mut v, i);
            i = i + 1;
        };
        
        // Sort the vector (more gas usage)
        let j = 0;
        while (j < vector::length(&v) - 1) {
            let k = j + 1;
            while (k < vector::length(&v)) {
                if (*vector::borrow(&v, j) > *vector::borrow(&v, k)) {
                    vector::swap(&mut v, j, k);
                };
                k = k + 1;
            };
            j = j + 1;
        };
        
        // Now post the message
        if (!exist_message()) {
            let board_obj_signer = get_board_obj_signer();
            move_to(&board_obj_signer, Message {
                string_content: new_string_content,
            });
        };
        let message = borrow_global_mut<Message>(get_board_obj_address());
        message.string_content = new_string_content;
    }

    // Failing transaction - will always abort
    public entry fun post_message_failing(
        _sender: &signer,
        new_string_content: String,
    ) {
        // Do some work first to consume gas
        let i = 0;
        while (i < 10) {
            i = i + 1;
        };
        
        // Then intentionally abort
        abort E_INTENTIONAL_FAILURE
    }

    // ======================== Read Functions ========================

    #[view]
    public fun exist_message(): bool {
        exists<Message>(get_board_obj_address())
    }

    #[view]
    public fun get_message_content(): (String) acquires Message {
        let message = borrow_global<Message>(get_board_obj_address());
        message.string_content
    }

    // ======================== Helper functions ========================

    fun get_board_obj_address(): address {
        object::create_object_address(&@message_board_addr, BOARD_OBJECT_SEED)
    }

    fun get_board_obj_signer(): signer acquires BoardObjectController {
        object::generate_signer_for_extending(&borrow_global<BoardObjectController>(get_board_obj_address()).extend_ref)
    }

    // ======================== Unit Tests ========================

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }
}
