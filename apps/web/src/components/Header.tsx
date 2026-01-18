import { Back, Calendar02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

function Header() {
	return (
		<nav className="flex items-center gap-3">
			<Link to="/login" className="flex items-center gap-1">
				<p>Login</p>
			</Link>

			<Link to="/leave-calendar" className="flex items-center gap-1">
				<HugeiconsIcon icon={Calendar02Icon} />
				<p>calendar</p>
			</Link>

			<Link to="/" className="flex items-center gap-1">
				<HugeiconsIcon icon={Back} />
				<p>Back</p>
			</Link>
		</nav>
	);
}

export default Header;
